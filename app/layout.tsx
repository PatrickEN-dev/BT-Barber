import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Footer from "./_components/Footer";
import AuthProvider from "./_providers/auth";
import { LoadingProvider } from "./_providers/loading";
import ThemeProvider from "./_providers/theme";
import TermsGate from "./_components/TermsGate";
import { Toaster } from "./_components/ui/sonner";
import ThemeSync from "./_components/ThemeSync";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BT-Barber",
  description:
    "Plataforma moderna de agendamento para barbearias — corte, barba e cuidados masculinos e femininos.",
};

export default function RootLayout({ children }: IChildrenComponent) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${sora.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LoadingProvider>
            <AuthProvider>
              <ThemeSync />
              <TermsGate />
              {children}
              <Footer />
              <Toaster />
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
        {/* <SpeedInsights />
        <Analytics /> */}
      </body>
    </html>
  );
}
