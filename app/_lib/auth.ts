import { db } from "@/app/_lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          role: true,
          theme: true,
          ownedShops: { select: { id: true }, take: 1 },
          barberProfile: { select: { id: true, barbershopId: true } },
        },
      });

      session.user = {
        ...session.user,
        id: user.id,
        role: dbUser?.role ?? "CUSTOMER",
        theme: dbUser?.theme ?? "SYSTEM",
        capabilities: {
          isOwner: (dbUser?.ownedShops?.length ?? 0) > 0,
          isBarber: !!dbUser?.barberProfile,
          barberShopId: dbUser?.barberProfile?.barbershopId ?? null,
        },
      };
      return session;
    },
  },
};
