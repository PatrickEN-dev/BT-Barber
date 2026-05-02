import "next-auth";
import { Theme, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface SessionCapabilities {
    isOwner: boolean;
    isBarber: boolean;
    barberShopId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      theme: Theme;
      capabilities: SessionCapabilities;
      /** ISO timestamp string of terms acceptance, or null if never accepted. */
      termsAcceptedAt: string | null;
      /** Version accepted (compare against TERMS_VERSION to detect re-prompt). */
      termsVersion: string | null;
    };
  }
}
