"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

interface EnsureAuthOptions {
  redirectPath?: string;
  description?: string;
}

export const useAuthGuard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  const ensureAuth = useCallback(
    ({ redirectPath = "/", description }: EnsureAuthOptions = {}) => {
      if (isLoading) return false;
      if (isAuthenticated) return true;

      toast.error("Acesso negado", {
        description:
          description ?? "Você precisa fazer login para acessar esta funcionalidade.",
      });
      router.push(redirectPath);
      return false;
    },
    [isAuthenticated, isLoading, router]
  );

  return {
    user: session?.user,
    session,
    isAuthenticated,
    isLoading,
    ensureAuth,
  };
};
