import type { Metadata } from "next";
import { BusFront, Map, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paradas con Sombra HMO",
  description:
    "Mapa local de paradas de transporte en Hermosillo con indicadores de sombra y riesgo por calor.",
};

const DONATION_URL = process.env.NEXT_PUBLIC_DONATION_URL ?? "";
const SHOW_INTERNAL_NAV = process.env.NEXT_PUBLIC_SHOW_INTERNAL_NAV === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
          <div className="bg-teal-50/80">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-teal-100 px-4 py-2 md:px-6">
              <p className="text-xs font-medium text-slate-700">
                Monitoreo comunitario de infraestructura de paradas de transporte.
              </p>
              <Link
                href="/mapa"
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-600"
              >
                <BusFront className="h-4 w-4" aria-hidden="true" />
                Explorar paradas
              </Link>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Proyecto comunitario
              </p>
              <Link href="/" className="text-xl font-semibold text-slate-900">
                Paradas con Sombra HMO
              </Link>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/mapa"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50"
              >
                <Map className="h-4 w-4" aria-hidden="true" />
                Mapa
              </Link>
              <Link
                href="/contribuir"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50"
              >
                <MessagesSquare className="h-4 w-4" aria-hidden="true" />
                Contribuir
              </Link>
              {SHOW_INTERNAL_NAV ? (
                <>
                  <Link
                    href="/acerca"
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                  >
                    Acerca
                  </Link>
                  <Link
                    href="/admin/paradas"
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                  >
                    Admin
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200/80 bg-white/90">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Creado por
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Ing. Andres Monreal
              </p>
              <p className="text-xs text-slate-600">
                Ingeniero Biomedico · Topic Tales Biomedica
              </p>
            </div>
            {DONATION_URL ? (
              <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Apoya el proyecto
                </p>
                <a
                  href={DONATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-8 items-center justify-center rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-teal-600"
                >
                  Donar con PayPal
                </a>
              </div>
            ) : null}
          </div>
        </footer>
      </body>
    </html>
  );
}
