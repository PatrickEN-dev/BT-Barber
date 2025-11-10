"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseAuthGuardOptions {
  redirectPath?: string;
  requireAuth?: boolean;
  showToast?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { redirectPath = "/", requireAuth = true, showToast = true } = options;

  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  const redirectToLogin = () => {
    if (showToast) {
      toast.error("Acesso negado", {
        description: "Você precisa fazer login para acessar esta funcionalidade.",
      });
    }
    router.push(redirectPath);
  };

  const checkAuthAndRedirect = () => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectPath, router]);

  return {
    isAuthenticated,
    isLoading,
    user: session?.user,
    session,
    redirectToLogin,
    checkAuthAndRedirect,
  };
};
