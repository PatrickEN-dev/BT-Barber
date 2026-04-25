import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./_components/Footer";
import AuthProvider from "./_providers/auth";
import { LoadingProvider } from "./_providers/loading";
import { Toaster } from "./_components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FSW-BarberShop",
  description:
    "Uma barbearia acolhedora e moderna, oferecendo serviços de corte de cabelo, barba e cuidados masculinos e femininos.",
};

export default function RootLayout({ children }: IChildrenComponent) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <LoadingProvider>
          <AuthProvider>
            {children}
            <Footer />
            <Toaster />
          </AuthProvider>
        </LoadingProvider>
        {/* <SpeedInsights />
        <Analytics /> */}
      </body>
    </html>
  );
}
