"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CreditCardIcon, QrCodeIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createBookingCheckout,
  createOrderCheckout,
  quoteCheckoutFee,
} from "@/app/_actions/payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedPayment } from "@/app/_lib/serializers";

import PixPanel from "./PixPanel";
import StripeCardForm from "./StripeCardForm";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the target is an Order (lojinha) or a Booking (serviço). */
  kind: "order" | "booking";
  targetId: string;
  /** Subtotal (services/products before platform fee). The fee is fetched via quoteCheckoutFee. */
  totalBRL: string;
  onPaid: () => void;
  /** URL the user lands on after Stripe redirects back from card flow. */
  returnPath?: string;
}

interface FeeQuote {
  subtotalBRL: string;
  feeBRL: string;
  totalBRL: string;
}

// Stripe.js loader is global. loadStripe is idempotent — calling repeatedly
// returns the same promise, so we can safely call it from a memoized scope.
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const CheckoutDialog = ({
  open,
  onOpenChange,
  kind,
  targetId,
  totalBRL,
  onPaid,
  returnPath,
}: CheckoutDialogProps) => {
  const [activeTab, setActiveTab] = useState<"pix" | "card">("pix");
  const [pixPayment, setPixPayment] = useState<SerializedPayment | null>(null);
  const [cardClientSecret, setCardClientSecret] = useState<string | null>(null);
  const [feeQuote, setFeeQuote] = useState<FeeQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState<{ pix: boolean; card: boolean }>({
    pix: false,
    card: false,
  });

  // Fee breakdown shown to the user — fetched lazily when the dialog opens.
  // Falls back to "totalBRL = subtotal" if quote fails (e.g. network blip).
  useEffect(() => {
    if (!open || feeQuote) return;
    quoteCheckoutFee({ kind, targetId })
      .then((q) =>
        setFeeQuote({ subtotalBRL: q.subtotalBRL, feeBRL: q.feeBRL, totalBRL: q.totalBRL })
      )
      .catch(() => {
        // Fallback: render no breakdown, just show the subtotal as total.
        setFeeQuote({ subtotalBRL: totalBRL, feeBRL: "0.00", totalBRL });
      });
  }, [open, kind, targetId, feeQuote, totalBRL]);

  const amountLabel = formatPrice(feeQuote?.totalBRL ?? totalBRL);
  const stripeInstance = useMemo(() => getStripe(), []);

  // Single function dispatching to the right server action by kind.
  const initiate = useMemo(
    () =>
      kind === "order"
        ? (method: "PIX" | "CARD") => createOrderCheckout({ orderId: targetId, method })
        : (method: "PIX" | "CARD") => createBookingCheckout({ bookingId: targetId, method }),
    [kind, targetId]
  );

  useEffect(() => {
    if (!open) return;
    if (activeTab === "pix" && !initialized.pix) {
      setLoading(true);
      initiate("PIX")
        .then((result) => {
          setPixPayment(result.payment);
          setInitialized((s) => ({ ...s, pix: true }));
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Erro ao gerar PIX");
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    }
    if (activeTab === "card" && !initialized.card) {
      setLoading(true);
      initiate("CARD")
        .then((result) => {
          if (!result.clientSecret) throw new Error("Stripe não retornou clientSecret");
          setCardClientSecret(result.clientSecret);
          setInitialized((s) => ({ ...s, card: true }));
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Erro ao iniciar cartão");
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, open, initialized, onOpenChange, initiate]);

  const handleClose = (next: boolean) => {
    if (!next) {
      setPixPayment(null);
      setCardClientSecret(null);
      setFeeQuote(null);
      setInitialized({ pix: false, card: false });
    }
    onOpenChange(next);
  };

  const defaultReturn = kind === "order" ? "/orders" : "/bookings";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar pagamento</DialogTitle>
          <DialogDescription>
            Pagamento processado com segurança pela Stripe.
          </DialogDescription>
        </DialogHeader>

        {feeQuote && Number(feeQuote.feeBRL) > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(feeQuote.subtotalBRL)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                Taxa de serviço
                <span
                  className="cursor-help text-[10px] text-muted-foreground/70"
                  title="Taxa cobrada pela plataforma para processar o pagamento online"
                >
                  ⓘ
                </span>
              </span>
              <span className="tabular-nums">+ {formatPrice(feeQuote.feeBRL)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-foreground">{amountLabel}</span>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "pix" | "card")}
          className="mt-2"
        >
          <TabsList className="w-full">
            <TabsTrigger value="pix" className="flex-1">
              <QrCodeIcon size={16} />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card" className="flex-1">
              <CreditCardIcon size={16} />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="mt-4">
            {loading && !pixPayment ? (
              <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">
                Gerando QR Code...
              </div>
            ) : pixPayment ? (
              <PixPanel
                payment={pixPayment}
                amountLabel={amountLabel}
                onPaid={() => {
                  onPaid();
                  handleClose(false);
                }}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            {loading && !cardClientSecret ? (
              <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">
                Carregando formulário...
              </div>
            ) : cardClientSecret && stripeInstance ? (
              <Elements
                stripe={stripeInstance}
                options={{
                  clientSecret: cardClientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "hsl(28 58% 38%)",
                      borderRadius: "12px",
                      fontFamily: "var(--font-sora), system-ui, sans-serif",
                    },
                  },
                  locale: "pt-BR",
                }}
              >
                <StripeCardForm
                  returnUrl={`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }${returnPath ?? defaultReturn}`}
                  amountLabel={amountLabel}
                />
              </Elements>
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
