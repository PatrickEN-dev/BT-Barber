"use client";

import { CheckCircle2Icon, ClockIcon, CopyIcon, LoaderIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { getPaymentStatus } from "@/app/_actions/payment";
import type { SerializedPayment } from "@/app/_lib/serializers";

interface PixPanelProps {
  payment: SerializedPayment;
  onPaid: () => void;
  amountLabel: string;
}

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const PixPanel = ({ payment, onPaid, amountLabel }: PixPanelProps) => {
  const [status, setStatus] = useState(payment.status);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => {
    if (!payment.expiresAt) return null;
    const ms = new Date(payment.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  });

  // Poll status every 3s as a fallback (webhook is the primary signal).
  useEffect(() => {
    if (status === "PAID" || status === "FAILED" || status === "EXPIRED") return;
    const interval = setInterval(async () => {
      try {
        const next = await getPaymentStatus(payment.id);
        if (next.status !== status) setStatus(next.status);
        if (next.status === "PAID") {
          onPaid();
          clearInterval(interval);
        }
      } catch {
        // network blip, try again next tick
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [payment.id, status, onPaid]);

  // Countdown tick.
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s !== null ? Math.max(0, s - 1) : s));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleCopy = async () => {
    if (!payment.qrCodeText) return;
    try {
      await navigator.clipboard.writeText(payment.qrCodeText);
      toast.success("Código copiado!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  if (status === "PAID") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon size={32} />
        </div>
        <div>
          <p className="text-lg font-bold">Pagamento confirmado!</p>
          <p className="mt-1 text-sm text-muted-foreground">{amountLabel} recebidos.</p>
        </div>
      </div>
    );
  }

  if (status === "EXPIRED" || (secondsLeft !== null && secondsLeft <= 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">QR Code expirado</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Feche e abra o checkout novamente para gerar um novo.
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">Falha no pagamento</p>
        <p className="mt-1 text-xs text-muted-foreground">Tente novamente em alguns instantes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {payment.qrCodeImage && (
        <div className="mx-auto rounded-2xl border border-border bg-white p-4 shadow-soft">
          <Image
            src={payment.qrCodeImage}
            alt="QR Code PIX"
            width={220}
            height={220}
            className="h-[220px] w-[220px]"
            unoptimized
          />
        </div>
      )}

      {payment.qrCodeText && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pix Copia e Cola
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={payment.qrCodeText}
              className="flex h-10 flex-1 truncate rounded-xl border border-input bg-card px-3 font-mono text-xs text-muted-foreground"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleCopy}
              aria-label="Copiar código"
            >
              <CopyIcon size={14} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderIcon size={12} className="animate-spin" />
          Aguardando pagamento...
        </span>
        {secondsLeft !== null && (
          <span className="flex items-center gap-1 text-sm font-bold tabular-nums">
            <ClockIcon size={14} />
            {formatCountdown(secondsLeft)}
          </span>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Abra o app do seu banco, escolha PIX → Copia e Cola ou escaneie o QR.
      </p>
    </div>
  );
};

export default PixPanel;
