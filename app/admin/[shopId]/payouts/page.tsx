import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownToLineIcon,
  CheckCheckIcon,
  CoinsIcon,
  PercentIcon,
  Undo2Icon,
} from "lucide-react";

import Container from "@/app/_components/Container";
import { Card, CardContent } from "@/app/_components/ui/card";
import { getShopBalance } from "@/app/_actions/payout";
import { formatPrice } from "@/app/_utils/formatPrices";
import { requireShopAccess } from "@/app/admin/_utils/requireOwner";

import PageHeading from "../_components/PageHeading";

interface IProps {
  params: { shopId: string };
}

const StatRow = ({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof CoinsIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warning" | "muted";
}) => {
  const toneClass =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4 lg:p-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Icon size={16} />
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className={`mt-1 text-xl font-bold tabular-nums tracking-tight ${toneClass}`}>
            {value}
          </span>
          {hint && <span className="mt-0.5 text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

const PayoutsPage = async ({ params }: IProps) => {
  const { shop } = await requireShopAccess(params.shopId);
  const balance = await getShopBalance(params.shopId);

  return (
    <main>
      <PageHeading
        eyebrow="Financeiro"
        title="Repasses"
        description={`Taxa da plataforma: ${shop.platformFeePercent.toString()}%`}
      />

      <Container className="space-y-6 pb-8">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <StatRow
            icon={ArrowDownToLineIcon}
            label="A receber"
            value={formatPrice(balance.pendingBRL)}
            hint={`${balance.paidPaymentsCount} pagamento${balance.paidPaymentsCount === 1 ? "" : "s"} confirmado${balance.paidPaymentsCount === 1 ? "" : "s"}`}
            tone="good"
          />
          <StatRow
            icon={CheckCheckIcon}
            label="Total recebido (bruto)"
            value={formatPrice(balance.totalEarnedBRL)}
            hint="Somando tudo que foi pago, descontados estornos"
          />
          <StatRow
            icon={Undo2Icon}
            label="Estornado"
            value={formatPrice(balance.totalRefundedBRL)}
            hint="Devolvido aos clientes em cancelamentos"
            tone="muted"
          />
          <StatRow
            icon={PercentIcon}
            label="Taxa retida pela plataforma"
            value={formatPrice(balance.totalPlatformFeeBRL)}
            hint="Não entra no seu repasse"
            tone="warning"
          />
        </div>

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Histórico de repasses
          </h2>
          {balance.payouts.length === 0 ? (
            <Card>
              <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhum repasse registrado ainda. A plataforma envia o saldo pendente
                periodicamente via PIX/TED — o histórico aparece aqui depois que o pagamento
                for marcado como concluído.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {balance.payouts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {format(p.paidAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        {p.notes && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{p.notes}</p>
                        )}
                      </div>
                      <span className="font-bold tabular-nums">
                        {formatPrice(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-dashed bg-muted/40">
          <CardContent className="p-4 text-xs text-muted-foreground lg:p-5">
            <strong className="text-foreground">Como funciona:</strong> a plataforma processa os
            pagamentos via Stripe e retém {shop.platformFeePercent.toString()}% como taxa de
            serviço. O saldo restante é enviado para a sua conta via PIX/TED periodicamente. Em
            caso de cancelamento dentro de 24h-2h da reserva, parte do valor fica retido como
            multa de cancelamento (compensação pela vaga bloqueada).
          </CardContent>
        </Card>
      </Container>
    </main>
  );
};

export default PayoutsPage;
