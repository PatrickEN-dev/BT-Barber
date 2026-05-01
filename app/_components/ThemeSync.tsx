"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

const ThemeSync = () => {
  const { data: session, status } = useSession();
  const { setTheme, theme } = useTheme();
  const hasSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !session.user.theme) {
      return;
    }
    if (hasSyncedRef.current === session.user.id) return;
    hasSyncedRef.current = session.user.id;

    const dbTheme = session.user.theme.toLowerCase();
    if (dbTheme !== theme) setTheme(dbTheme);
  }, [status, session?.user?.id, session?.user?.theme, theme, setTheme]);

  return null;
};

export default ThemeSync;
