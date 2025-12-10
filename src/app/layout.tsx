import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/presentation/components/providers/SessionProvider";
import { ThemeProvider } from "@/presentation/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nutri Journey - Plataforma de Nutrição",
  description: "Plataforma profissional para gestão de pacientes e consultas nutricionais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

