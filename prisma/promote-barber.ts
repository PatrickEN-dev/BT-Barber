import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [, , email, barberId] = process.argv;

  if (!email || !barberId) {
    console.error("Uso: ts-node prisma/promote-barber.ts <email> <barberId>");
    process.exit(1);
  }

  const user = await db.user.update({
    where: { email },
    data: { role: "BARBER" },
  });

  await db.barber.update({
    where: { id: barberId },
    data: { userId: user.id },
  });

  console.log(`✓ ${email} é BARBER vinculado ao perfil ${barberId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
