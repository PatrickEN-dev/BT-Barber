import { Prisma, PrismaClient, ProductCategory } from "@prisma/client";

const db = new PrismaClient();

interface ProductTemplate {
  name: string;
  description: string;
  imageSlug: string;
  price: number;
  category: ProductCategory;
  stockMin: number;
  stockMax: number;
}

const PRODUCT_CATALOG: ProductTemplate[] = [
  // BEBIDAS
  {
    name: "Cerveja Heineken 350ml",
    description: "Long neck gelado, ideal pra acompanhar o corte.",
    imageSlug: "heineken-beer",
    price: 8,
    category: "DRINK",
    stockMin: 12,
    stockMax: 30,
  },
  {
    name: "Coca-Cola Lata 350ml",
    description: "Refrigerante clássico geladinho.",
    imageSlug: "cocacola-can",
    price: 6,
    category: "DRINK",
    stockMin: 20,
    stockMax: 40,
  },
  {
    name: "Água Mineral 500ml",
    description: "Água sem gás na temperatura ambiente.",
    imageSlug: "water-bottle",
    price: 4,
    category: "DRINK",
    stockMin: 25,
    stockMax: 50,
  },
  {
    name: "Red Bull Energético 250ml",
    description: "Energético pra renovar o astral.",
    imageSlug: "redbull-energy",
    price: 12,
    category: "DRINK",
    stockMin: 6,
    stockMax: 18,
  },

  // CABELO
  {
    name: "Pomada Modeladora 100g",
    description: "Fixação forte com efeito matte natural.",
    imageSlug: "hair-pomade-matte",
    price: 38,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 15,
  },
  {
    name: "Gel Fixador Premium",
    description: "Modelagem firme sem deixar resíduos brancos.",
    imageSlug: "hair-gel-premium",
    price: 22,
    category: "HAIR_CARE",
    stockMin: 8,
    stockMax: 20,
  },
  {
    name: "Cera Modeladora Matte",
    description: "Acabamento seco com fixação média.",
    imageSlug: "hair-wax-matte",
    price: 32,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 14,
  },
  {
    name: "Shampoo Profissional 250ml",
    description: "Limpeza profunda sem ressecar os fios.",
    imageSlug: "shampoo-pro-bottle",
    price: 45,
    category: "HAIR_CARE",
    stockMin: 4,
    stockMax: 12,
  },

  // BARBA
  {
    name: "Óleo de Barba 30ml",
    description: "Hidrata, amacia e perfuma a barba.",
    imageSlug: "beard-oil-bottle",
    price: 38,
    category: "BEARD_CARE",
    stockMin: 6,
    stockMax: 16,
  },
  {
    name: "Balm Hidratante 50g",
    description: "Controla volume e mantém a barba alinhada.",
    imageSlug: "beard-balm-jar",
    price: 32,
    category: "BEARD_CARE",
    stockMin: 5,
    stockMax: 14,
  },

  // ACESSÓRIOS
  {
    name: "Pente de Madeira",
    description: "Pente artesanal antiestático em madeira nobre.",
    imageSlug: "wooden-comb-acc",
    price: 18,
    category: "ACCESSORY",
    stockMin: 8,
    stockMax: 25,
  },
];

const imageUrl = (slug: string, shopIdx: number) =>
  `https://picsum.photos/seed/${slug}-${shopIdx}/600/600`;

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const shops = await db.barbershop.findMany({ orderBy: { createdAt: "asc" } });

  if (shops.length === 0) {
    console.log("⚠️  No barbershops found. Run `pnpm prisma db seed` first.");
    return;
  }

  let totalCreated = 0;
  let skippedShops = 0;

  for (let idx = 0; idx < shops.length; idx += 1) {
    const shop = shops[idx];
    const existing = await db.product.count({ where: { barbershopId: shop.id } });
    if (existing > 0) {
      skippedShops += 1;
      continue;
    }

    const products = PRODUCT_CATALOG.map((tpl) => ({
      barbershopId: shop.id,
      name: tpl.name,
      description: tpl.description,
      imageUrl: imageUrl(tpl.imageSlug, idx),
      price: new Prisma.Decimal(tpl.price),
      stock: randomBetween(tpl.stockMin, tpl.stockMax),
      category: tpl.category,
      active: true,
    }));

    await db.product.createMany({ data: products });
    totalCreated += products.length;
    console.log(`✓ ${shop.name}: +${products.length} produtos`);
  }

  console.log(
    `\nDone. Created ${totalCreated} products. Skipped ${skippedShops} shops that already had products.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
