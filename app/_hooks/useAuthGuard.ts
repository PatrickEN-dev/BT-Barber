"use client";

import { signIn, useSession } from "next-auth/react";
import { useCallback } from "react";

interface EnsureAuthOptions {
  callbackUrl?: string;
}

export const useAuthGuard = () => {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  const ensureAuth = useCallback(
    ({ callbackUrl }: EnsureAuthOptions = {}) => {
      if (isLoading) return false;
      if (isAuthenticated) return true;

      const target =
        callbackUrl ??
        (typeof window !== "undefined" ? window.location.href : "/");
      signIn("google", { callbackUrl: target });
      return false;
    },
    [isAuthenticated, isLoading]
  );

  return {
    user: session?.user,
    session,
    isAuthenticated,
    isLoading,
    ensureAuth,
  };
};
