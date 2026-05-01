import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import Container from "@/app/_components/Container";
import Header from "@/app/_components/Header";
import { Button } from "@/app/_components/ui/button";
import { findUserOrders } from "@/app/_actions/order";
import { authOptions } from "@/app/_lib/auth";
import { requireCustomer } from "@/app/_utils/redirectIfOwner";

import UserOrderCard from "./_components/UserOrderCard";

const OrdersPage = async () => {
  await requireCustomer();
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const orders = await findUserOrders(userId);

  const activeStatuses = new Set(["PENDING", "CONFIRMED", "READY"]);
  const active = orders.filter((o) => activeStatuses.has(o.status));
  const past = orders.filter((o) => !activeStatuses.has(o.status));

  return (
    <main className="pb-24">
      <Header />

      <Container className="py-6 lg:py-10">
        <header className="mb-8 animate-slide-up lg:mb-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Lojinha
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl xl:text-4xl">
            Meus pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length === 0
              ? "Você ainda não fez nenhum pedido."
              : `${active.length} em andamento · ${past.length} ${past.length === 1 ? "concluído/cancelado" : "concluídos/cancelados"}`}
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <ShoppingBagIcon size={36} className="mx-auto mb-4 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              Visite a aba &ldquo;Loja&rdquo; em alguma barbearia para fazer seu primeiro pedido.
            </p>
            <Button variant="accent" asChild>
              <Link href="/">Explorar barbearias</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-12">
            <section
              className="animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <header className="mb-4 flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Em andamento
                </h2>
                <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
                  {active.length}
                </span>
              </header>
              {active.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {active.map((order) => (
                    <li key={order.id}>
                      <UserOrderCard order={order} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum pedido em andamento.</p>
                </div>
              )}
            </section>

            <section
              className="animate-slide-up"
              style={{ animationDelay: "180ms" }}
            >
              <header className="mb-4 flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Histórico
                </h2>
                <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
                  {past.length}
                </span>
              </header>
              {past.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {past.map((order) => (
                    <li key={order.id}>
                      <UserOrderCard order={order} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum pedido concluído ainda.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </Container>
    </main>
  );
};

export default OrdersPage;
