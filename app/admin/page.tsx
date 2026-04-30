import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, StoreIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { Card, CardContent } from "@/app/_components/ui/card";

const AdminIndexPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const shops = await db.barbershop.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true, imageUrl: true },
  });

  if (shops.length === 0) {
    return (
      <main className="px-5 py-10 max-w-md mx-auto">
        <h1 className="text-xl font-bold">Nenhuma barbearia atribuída</h1>
        <p className="mt-2 text-sm text-gray-400">
          Sua conta é dona, mas ainda não foi vinculada a nenhuma barbearia. Fale com o suporte.
        </p>
      </main>
    );
  }

  if (shops.length === 1) redirect(`/admin/${shops[0].id}/dashboard`);

  return (
    <main className="px-5 py-8 max-w-md mx-auto pb-20">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Suas barbearias</h1>
        <p className="text-sm text-gray-400 mt-1">Selecione qual painel deseja abrir.</p>
      </header>

      <ul className="flex flex-col gap-3">
        {shops.map((shop) => (
          <li key={shop.id}>
            <Link href={`/admin/${shop.id}/dashboard`}>
              <Card className="hover:bg-accent/40 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-md overflow-hidden bg-secondary shrink-0">
                    {shop.imageUrl ? (
                      <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <StoreIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{shop.name}</h2>
                    <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                  </div>
                  <ChevronRightIcon size={18} className="text-gray-400 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AdminIndexPage;
