import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const barberNames = [
  "Rafael Almeida",
  "Lucas Ferreira",
  "Diego Souza",
  "Pedro Henrique",
  "Marcos Vinícius",
  "Bruno Carvalho",
  "Thiago Ribeiro",
  "Gabriel Oliveira",
  "Eduardo Santos",
  "Felipe Rocha",
  "André Mendes",
  "Caio Barbosa",
];

const barberDescriptions = [
  "Especialista em cortes clássicos e barba na navalha. 8 anos de experiência.",
  "Apaixonado por degradês modernos e desenhos. Atende a todos os tipos de cabelo.",
  "Tradicional e detalhista. Foco em barba lenhador e bigode.",
  "Cortes esportivos, fades americanos e contornos precisos.",
  "Barbeiro premiado. Atendimento premium com toalha quente.",
  "Estilo moderno: undercut, pompadour e texturizações.",
  "Atende a clientela jovem. Cortes da moda e dicas de cuidado capilar.",
  "Especialidade em cabelos crespos e cacheados. Hidratação profissional.",
];

const barberImages = [
  "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
  "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
  "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
  "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
  "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function randomRating(): number {
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

async function main() {
  const shops = await prisma.barbershop.findMany({
    include: { Service: true, Barbers: { select: { id: true } } },
  });

  let createdShops = 0;
  let createdBarbers = 0;

  for (const shop of shops) {
    if (shop.Barbers.length > 0) continue;
    if (shop.Service.length === 0) {
      console.log(`Skipping ${shop.name} — no services to attach.`);
      continue;
    }

    const barbersForShop = pickRandom(barberNames, 3);

    for (const name of barbersForShop) {
      const services = pickRandom(shop.Service, 3 + Math.floor(Math.random() * 3));

      await prisma.barber.create({
        data: {
          name,
          description: pickRandom(barberDescriptions, 1)[0],
          rating: randomRating(),
          imageUrl: pickRandom(barberImages, 1)[0],
          barbershopId: shop.id,
          services: {
            connect: services.map((s) => ({ id: s.id })),
          },
        },
      });
      createdBarbers++;
    }
    createdShops++;
  }

  console.log(
    `Done. Seeded ${createdBarbers} barbers across ${createdShops} barbershops (${
      shops.length - createdShops
    } skipped).`
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
