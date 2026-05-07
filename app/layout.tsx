import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { ToastProvider } from "@/components/ui/toast";
import { SetupBanner } from "@/components/ui/setup-banner";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bento — Relatórios CAPT",
  description: "Ferramenta de preenchimento automatizado de relatórios de averiguação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <ToastProvider>
          <ConfirmProvider>
            <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="font-semibold tracking-tight">
                  Bento <span className="text-zinc-400 font-normal">· CAPT</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                  <Link href="/" className="hover:underline">
                    Processos
                  </Link>
                  <Link href="/settings" className="hover:underline">
                    Definições
                  </Link>
                  <Link
                    href="/processos/novo"
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Novo processo
                  </Link>
                </nav>
              </div>
            </header>
            <SetupBanner />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
