import { Prisma, PrismaClient, ProductCategory } from "@prisma/client";

const db = new PrismaClient();

interface ProductTemplate {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: ProductCategory;
  stockMin: number;
  stockMax: number;
}

// Each product points to a verified Wikimedia Commons URL (public domain / CC license).
// All URLs were checked with HEAD requests during seed authoring.
const PRODUCT_CATALOG: ProductTemplate[] = [
  // BEBIDAS
  {
    name: "Cerveja Heineken 350ml",
    description: "Long neck gelado, ideal pra acompanhar o corte.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/96/Heineken_Bottle.jpg",
    price: 8,
    category: "DRINK",
    stockMin: 12,
    stockMax: 30,
  },
  {
    name: "Coca-Cola Lata 350ml",
    description: "Refrigerante clássico geladinho.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/Coca-Cola_lata.jpg",
    price: 6,
    category: "DRINK",
    stockMin: 20,
    stockMax: 40,
  },
  {
    name: "Água Mineral 500ml",
    description: "Água sem gás na temperatura ambiente.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Stilles_Mineralwasser.jpg",
    price: 4,
    category: "DRINK",
    stockMin: 25,
    stockMax: 50,
  },
  {
    name: "Red Bull Energético 250ml",
    description: "Energético pra renovar o astral.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Red_Bull_energy_drinks.jpg",
    price: 12,
    category: "DRINK",
    stockMin: 6,
    stockMax: 18,
  },

  // CABELO
  {
    name: "Pomada Modeladora 100g",
    description: "Fixação forte com efeito matte natural.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Can_of_Pomade_%28Royal_Crown%29.jpg",
    price: 38,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 15,
  },
  {
    name: "Gel Fixador Premium",
    description: "Modelagem firme sem deixar resíduos brancos.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Hair_gel.jpg",
    price: 22,
    category: "HAIR_CARE",
    stockMin: 8,
    stockMax: 20,
  },
  {
    name: "Cera Modeladora Matte",
    description: "Acabamento seco com fixação média.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/48/Hair_wax.jpg",
    price: 32,
    category: "HAIR_CARE",
    stockMin: 5,
    stockMax: 14,
  },
  {
    name: "Shampoo Dove 250ml",
    description: "Limpeza diária sem ressecar os fios.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/68/Dove_shampoo_bottle.jpg",
    price: 45,
    category: "HAIR_CARE",
    stockMin: 4,
    stockMax: 12,
  },

  // BARBA
  {
    name: "Óleo de Barba 30ml",
    description: "Hidrata, amacia e perfuma a barba.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/67/Beard_Oil_and_Brush.jpg",
    price: 38,
    category: "BEARD_CARE",
    stockMin: 6,
    stockMax: 16,
  },
  {
    name: "Balm Hidratante 50g",
    description: "Pote cremoso pra hidratar e alinhar a barba.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Day_cream_02.jpg",
    price: 32,
    category: "BEARD_CARE",
    stockMin: 5,
    stockMax: 14,
  },

  // ACESSÓRIOS
  {
    name: "Pente Profissional",
    description: "Pente antiestático ideal pra finalização.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4a/Plastic_comb%2C_2015-06-07.jpg",
    price: 18,
    category: "ACCESSORY",
    stockMin: 8,
    stockMax: 25,
  },
];

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
      imageUrl: tpl.imageUrl,
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
