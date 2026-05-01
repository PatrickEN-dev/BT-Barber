"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CreditCardIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";

interface StripeCardFormProps {
  /** URL the user lands on after Stripe redirects back (3DS challenges, etc). */
  returnUrl: string;
  amountLabel: string;
}

const StripeCardForm = ({ returnUrl, amountLabel }: StripeCardFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (error) {
      toast.error(error.message ?? "Pagamento recusado");
      setSubmitting(false);
    }
    // On success, Stripe redirects — no further code runs here.
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { address: "never" } },
        }}
      />

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={!stripe || !elements || submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <LoaderIcon size={16} className="mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCardIcon size={16} className="mr-2" />
            Pagar {amountLabel}
          </>
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Pagamento processado com segurança pela Stripe. Aceitamos parcelamento em até 12x.
      </p>
    </form>
  );
};

export default StripeCardForm;
