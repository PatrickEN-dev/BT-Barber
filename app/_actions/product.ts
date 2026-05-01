"use server";

import { ProductCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import { serializeProduct, type SerializedProduct } from "@/app/_lib/serializers";

import { UnauthorizedError } from "./_errors";

export const findShopProducts = async (
  barbershopId: string,
  options: { includeInactive?: boolean } = {}
): Promise<SerializedProduct[]> => {
  const products = await db.product.findMany({
    where: {
      barbershopId,
      ...(options.includeInactive ? {} : { active: true }),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
};

interface ProductInput {
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: ProductCategory;
  active?: boolean;
}

const requireOwnerOf = async (barbershopId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  const shop = await db.barbershop.findFirst({
    where: { id: barbershopId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!shop) throw new UnauthorizedError();
  return session.user.id;
};

const isHttpsUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const validate = (input: ProductInput) => {
  const name = input.name?.trim();
  const imageUrl = input.imageUrl?.trim();
  if (!name) throw new Error("Nome é obrigatório.");
  if (name.length > 120) throw new Error("Nome muito longo (máx 120 caracteres).");
  if (input.description && input.description.length > 500)
    throw new Error("Descrição muito longa (máx 500 caracteres).");
  if (!imageUrl) throw new Error("URL da imagem é obrigatória.");
  if (!isHttpsUrl(imageUrl))
    throw new Error("URL da imagem deve começar com http:// ou https://.");
  if (imageUrl.length > 2048) throw new Error("URL da imagem muito longa.");
  if (Number.isNaN(input.price) || input.price < 0 || input.price > 100000)
    throw new Error("Preço inválido.");
  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > 100000)
    throw new Error("Estoque inválido.");
};

export const createProduct = async (barbershopId: string, input: ProductInput) => {
  const userId = await requireOwnerOf(barbershopId);
  await rateLimit(`shop:${barbershopId}:productMutate`, {
    max: 30,
    windowMs: 60_000,
  });
  validate(input);

  const product = await db.product.create({
    data: {
      barbershopId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      price: input.price,
      stock: input.stock,
      category: input.category,
      active: input.active ?? true,
    },
  });

  revalidatePath(`/admin/${barbershopId}/products`);
  revalidatePath(`/barbershop/${barbershopId}`);

  await audit({
    userId,
    action: "PRODUCT_CREATE",
    barbershopId,
    targetType: "Product",
    targetId: product.id,
    metadata: { name: product.name, price: product.price.toString() },
  });

  return serializeProduct(product);
};

export const updateProduct = async (productId: string, input: ProductInput) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  const userId = await requireOwnerOf(existing.barbershopId);
  await rateLimit(`shop:${existing.barbershopId}:productMutate`, {
    max: 30,
    windowMs: 60_000,
  });
  validate(input);

  const product = await db.product.update({
    where: { id: productId },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      price: input.price,
      stock: input.stock,
      category: input.category,
      active: input.active ?? true,
    },
  });

  revalidatePath(`/admin/${existing.barbershopId}/products`);
  revalidatePath(`/barbershop/${existing.barbershopId}`);

  await audit({
    userId,
    action: "PRODUCT_UPDATE",
    barbershopId: existing.barbershopId,
    targetType: "Product",
    targetId: productId,
  });

  return serializeProduct(product);
};

export const toggleProductActive = async (productId: string) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true, active: true },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  const userId = await requireOwnerOf(existing.barbershopId);
  await rateLimit(`shop:${existing.barbershopId}:productMutate`, {
    max: 30,
    windowMs: 60_000,
  });

  await db.product.update({
    where: { id: productId },
    data: { active: !existing.active },
  });

  revalidatePath(`/admin/${existing.barbershopId}/products`);
  revalidatePath(`/barbershop/${existing.barbershopId}`);

  await audit({
    userId,
    action: "PRODUCT_TOGGLE_ACTIVE",
    barbershopId: existing.barbershopId,
    targetType: "Product",
    targetId: productId,
    metadata: { active: !existing.active },
  });
};

export const deleteProduct = async (productId: string) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true, _count: { select: { orderItems: true } } },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  const userId = await requireOwnerOf(existing.barbershopId);
  await rateLimit(`shop:${existing.barbershopId}:productMutate`, {
    max: 30,
    windowMs: 60_000,
  });

  const softDelete = existing._count.orderItems > 0;
  if (softDelete) {
    await db.product.update({
      where: { id: productId },
      data: { active: false },
    });
  } else {
    await db.product.delete({ where: { id: productId } });
  }

  revalidatePath(`/admin/${existing.barbershopId}/products`);
  revalidatePath(`/barbershop/${existing.barbershopId}`);

  await audit({
    userId,
    action: "PRODUCT_DELETE",
    barbershopId: existing.barbershopId,
    targetType: "Product",
    targetId: productId,
    metadata: { softDelete },
  });
};
