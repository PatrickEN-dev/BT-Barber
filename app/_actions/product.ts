"use server";

import { ProductCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
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
};

const validate = (input: ProductInput) => {
  if (!input.name?.trim()) throw new Error("Nome é obrigatório.");
  if (!input.imageUrl?.trim()) throw new Error("URL da imagem é obrigatória.");
  if (Number.isNaN(input.price) || input.price < 0) throw new Error("Preço inválido.");
  if (!Number.isInteger(input.stock) || input.stock < 0) throw new Error("Estoque inválido.");
};

export const createProduct = async (barbershopId: string, input: ProductInput) => {
  await requireOwnerOf(barbershopId);
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

  return serializeProduct(product);
};

export const updateProduct = async (productId: string, input: ProductInput) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  await requireOwnerOf(existing.barbershopId);
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

  return serializeProduct(product);
};

export const toggleProductActive = async (productId: string) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true, active: true },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  await requireOwnerOf(existing.barbershopId);

  await db.product.update({
    where: { id: productId },
    data: { active: !existing.active },
  });

  revalidatePath(`/admin/${existing.barbershopId}/products`);
  revalidatePath(`/barbershop/${existing.barbershopId}`);
};

export const deleteProduct = async (productId: string) => {
  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { barbershopId: true, _count: { select: { orderItems: true } } },
  });
  if (!existing) throw new Error("Produto não encontrado.");
  await requireOwnerOf(existing.barbershopId);

  if (existing._count.orderItems > 0) {
    await db.product.update({
      where: { id: productId },
      data: { active: false },
    });
  } else {
    await db.product.delete({ where: { id: productId } });
  }

  revalidatePath(`/admin/${existing.barbershopId}/products`);
  revalidatePath(`/barbershop/${existing.barbershopId}`);
};
