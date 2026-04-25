"use client";

import React from "react";
import { useAuthGuard } from "../_hooks/useAuthGuard";
import Loading from "../_components/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectPath = "/",
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuthGuard({ 
    redirectPath, 
    requireAuth: true 
  });

  if (isLoading) {
    return fallback || <Loading />;
  }

  if (!isAuthenticated) {
    return fallback || <Loading />;
  }

  return <>{children}</>;
};