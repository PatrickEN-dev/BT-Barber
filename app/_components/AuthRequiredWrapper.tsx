"use client";

import React from "react";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";

interface AuthRequiredWrapperProps {
  children: React.ReactNode;
  onUnauthorized?: () => void;
  fallback?: React.ReactNode;
}

export const AuthRequiredWrapper: React.FC<AuthRequiredWrapperProps> = ({
  children,
  onUnauthorized,
  fallback,
}) => {
  const { isAuthenticated, redirectToLogin } = useAuthGuard({ requireAuth: false });

  const handleClick = (event: React.MouseEvent) => {
    if (!isAuthenticated) {
      event.preventDefault();
      event.stopPropagation();

      if (onUnauthorized) {
        onUnauthorized();
      } else {
        redirectToLogin();
      }
      return;
    }
  };

  if (!isAuthenticated && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div onClick={handleClick} style={{ cursor: isAuthenticated ? "pointer" : "pointer" }}>
      {children}
    </div>
  );
};
