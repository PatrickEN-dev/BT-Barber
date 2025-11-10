"use client";

import { toast } from "sonner";

export const handleUnauthenticatedAction = (action: string = "realizar esta ação") => {
  toast.error("Login necessário", {
    description: `Você precisa estar logado para ${action}.`,
    action: {
      label: "Fazer login",
      onClick: () => (window.location.href = "/"),
    },
  });
};

export const withAuthCheck = (
  callback: () => void,
  isAuthenticated: boolean,
  actionName?: string
) => {
  return () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction(actionName);
      return;
    }
    callback();
  };
};

export const validateUserSession = (user: any, actionName: string = "continuar") => {
  if (!user) {
    handleUnauthenticatedAction(actionName);
    return false;
  }
  return true;
};
