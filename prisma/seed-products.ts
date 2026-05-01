import { Prisma, PrismaClient, ProductCategory } from "@prisma/client";

const db = new PrismaClient();

interface ProductTemplate {
  name: string;
  description: string;
  imageTags: string;
  imageSeed: string;
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
    imageTags: "heineken,beer,bottle",
    imageSeed: "heineken-bottle",
    price: 8,
    category: "DRINK",
    stockMin: 12,
    stockMax: 30,
  },
  {
    name: "Coca-Cola Lata 350ml",
    description: "Refrigerante clássico geladinho.",
    imageTags: "coca-cola,can,soda",
    imageSeed: "cocacola-can",
    price: 6,
    category: "DRINK",
    stockMin: 20,
    stockMax: 40,
  },
  {
    name: "Água Mineral 500ml",
    description: "Água sem gás na temperatura ambiente.",
    imageTags: "water,bottle,mineral",
    imageSeed: "water-bottle",
    price: 4,
    category: "DRINK",
    stockMin: 25,
    stockMax: 50,
  },
  {
    name: "Red Bull Energético 250ml",
    description: "Energético pra renovar o astral.",
    imageTags: "redbull,energy,drink",
    imageSeed: "redbull-can",
    price: 12,
    category: "DRINK",
    stockMin: 6,
    stockMax: 18,
  },

  // CABELO
  {
    name: "Pomada Modeladora 100g",
    description: "Fixação forte com efeito matte natural.",
    imageTags: "pomade,hair,jar",
    imageSeed: "hair-pomade",
    price: 38,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 15,
  },
  {
    name: "Gel Fixador Premium",
    description: "Modelagem firme sem deixar resíduos brancos.",
    imageTags: "hair-gel,styling,bottle",
    imageSeed: "hair-gel",
    price: 22,
    category: "HAIR_CARE",
    stockMin: 8,
    stockMax: 20,
  },
  {
    name: "Cera Modeladora Matte",
    description: "Acabamento seco com fixação média.",
    imageTags: "hair-wax,matte,jar",
    imageSeed: "hair-wax",
    price: 32,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 14,
  },
  {
    name: "Shampoo Profissional 250ml",
    description: "Limpeza profunda sem ressecar os fios.",
    imageTags: "shampoo,bottle,bathroom",
    imageSeed: "shampoo-pro",
    price: 45,
    category: "HAIR_CARE",
    stockMin: 4,
    stockMax: 12,
  },

  // BARBA
  {
    name: "Óleo de Barba 30ml",
    description: "Hidrata, amacia e perfuma a barba.",
    imageTags: "beard-oil,grooming,bottle",
    imageSeed: "beard-oil",
    price: 38,
    category: "BEARD_CARE",
    stockMin: 6,
    stockMax: 16,
  },
  {
    name: "Balm Hidratante 50g",
    description: "Controla volume e mantém a barba alinhada.",
    imageTags: "beard-balm,grooming,jar",
    imageSeed: "beard-balm",
    price: 32,
    category: "BEARD_CARE",
    stockMin: 5,
    stockMax: 14,
  },

  // ACESSÓRIOS
  {
    name: "Pente de Madeira",
    description: "Pente artesanal antiestático em madeira nobre.",
    imageTags: "wooden-comb,barber,grooming",
    imageSeed: "wooden-comb",
    price: 18,
    category: "ACCESSORY",
    stockMin: 8,
    stockMax: 25,
  },
];

const imageUrl = (tags: string, seed: string, shopIdx: number) =>
  `https://loremflickr.com/600/600/${tags}/all?lock=${shopIdx}-${seed}`;

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const shouldReset = process.argv.includes("--reset");

  if (shouldReset) {
    console.log("⚠️  --reset: wiping OrderItems, Orders and Products...");
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.product.deleteMany({});
  }

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
      imageUrl: imageUrl(tpl.imageTags, tpl.imageSeed, idx),
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
