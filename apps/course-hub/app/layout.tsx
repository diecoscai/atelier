import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atelier — AI Engineering, forged by building",
  description:
    "El taller donde Diego se forja como AI Engineer construyendo Grounded, un RAG SaaS de producción. Curso, evals y defensa en un solo lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-stone-800/80 sticky top-0 z-10 bg-stone-950/85 backdrop-blur">
          <nav className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight flex items-center gap-2">
              <span className="text-amber-500">▲</span> Atelier
            </Link>
            <div className="flex items-center gap-5 text-sm text-stone-400">
              <Link href="/" className="hover:text-stone-100">Mapa</Link>
              <Link href="/evals" className="hover:text-stone-100">Evals</Link>
              <Link href="/decisions" className="hover:text-stone-100">Decisiones</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-8">{children}</main>
        <footer className="border-t border-stone-800/80 text-stone-500 text-xs">
          <div className="mx-auto max-w-5xl px-5 py-6 flex flex-wrap gap-2 justify-between">
            <span>Atelier · producto-curso AI Engineer</span>
            <span>Construye → mide → <span className="text-amber-600">defiende</span></span>
          </div>
        </footer>
      </body>
    </html>
  );
}
