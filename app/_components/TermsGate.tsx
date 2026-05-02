"use client";

import { ScrollIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { acceptTerms } from "@/app/_actions/user";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { isCurrentTermsVersion } from "@/app/_lib/terms";

/**
 * Modal that prompts authenticated users to accept the platform's terms on
 * first login (or after a TERMS_VERSION bump). Non-dismissable — the user
 * can either accept or sign out. Mounted globally in the root layout so it
 * gates both customer and admin/barber flows.
 *
 * Intentionally minimalist: we don't make the user read the legal pages
 * inline, we just ask for explicit consent with prominent links to the
 * full text.
 */
const TermsGate = () => {
  const { data: session, status, update } = useSession();
  const [pending, startTransition] = useTransition();
  // Local "accepted" flag so the modal closes instantly on click without
  // waiting for the session refresh to round-trip.
  const [justAccepted, setJustAccepted] = useState(false);

  if (status !== "authenticated" || !session?.user) return null;
  if (justAccepted) return null;
  if (
    session.user.termsAcceptedAt &&
    isCurrentTermsVersion(session.user.termsVersion)
  ) {
    return null;
  }

  const handleAccept = () => {
    startTransition(async () => {
      try {
        await acceptTerms();
        setJustAccepted(true);
        // Refresh the session so subsequent renders see termsAcceptedAt populated.
        await update();
      } catch {
        toast.error("Não foi possível registrar o aceite. Tente novamente.");
      }
    });
  };

  return (
    <Dialog open>
      <DialogContent
        // Block all dismiss paths — user must click "Concordar" or sign out.
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md [&>button]:hidden"
      >
        <DialogHeader>
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <ScrollIcon size={20} />
          </div>
          <DialogTitle>Antes de continuar</DialogTitle>
          <DialogDescription>
            Pra usar a BT-Barber você precisa concordar com os documentos
            abaixo. Levam 2 minutos pra ler — recomendamos dar uma olhada.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link
              href="/termos"
              target="_blank"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <span>
                <span className="block font-semibold text-foreground">
                  Termos de Uso
                </span>
                <span className="text-xs text-muted-foreground">
                  Como funciona a plataforma e suas responsabilidades
                </span>
              </span>
              <span className="text-xs font-bold text-accent">Abrir →</span>
            </Link>
          </li>
          <li>
            <Link
              href="/privacidade"
              target="_blank"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <span>
                <span className="block font-semibold text-foreground">
                  Política de Privacidade
                </span>
                <span className="text-xs text-muted-foreground">
                  O que coletamos e como protegemos seus dados (LGPD)
                </span>
              </span>
              <span className="text-xs font-bold text-accent">Abrir →</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cancelamento"
              target="_blank"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <span>
                <span className="block font-semibold text-foreground">
                  Política de Cancelamento
                </span>
                <span className="text-xs text-muted-foreground">
                  Regras de reembolso de reservas e pedidos
                </span>
              </span>
              <span className="text-xs font-bold text-accent">Abrir →</span>
            </Link>
          </li>
        </ul>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            variant="accent"
            className="w-full"
            disabled={pending}
            onClick={handleAccept}
          >
            {pending ? "Registrando..." : "Concordar e continuar"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Não concorda? <a href="/api/auth/signout" className="underline hover:text-foreground">Sair da conta</a>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsGate;
