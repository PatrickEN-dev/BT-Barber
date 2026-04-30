import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [, , email, shopId] = process.argv;

  if (!email) {
    console.error("Uso: ts-node prisma/promote-owner.ts <email> [shopId]");
    process.exit(1);
  }

  const user = await db.user.update({
    where: { email },
    data: { role: "OWNER" },
  });

  if (shopId) {
    await db.barbershop.update({
      where: { id: shopId },
      data: { ownerId: user.id },
    });
    console.log(`✓ ${email} é OWNER da barbearia ${shopId}`);
  } else {
    console.log(`✓ ${email} promovido a OWNER (sem barbearia atribuída)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
