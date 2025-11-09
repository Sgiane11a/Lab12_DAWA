import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library Dashboard",
  description: "App con rutas API para autores y libros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="bg-light border-bottom">
          <nav className="container d-flex flex-wrap align-items-center justify-content-between py-3">
            <Link href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
              <strong>Library</strong>
            </Link>
            <ul className="nav">
              <li className="nav-item"><Link href="/" className="nav-link px-2">Dashboard</Link></li>
              <li className="nav-item"><Link href="/books" className="nav-link px-2">Libros</Link></li>
            </ul>
          </nav>
        </header>

        <main className="container container-app">
          {children}
        </main>

        <footer className="text-center py-4 text-muted border-top">
          <div className="container">&copy; {new Date().getFullYear()} Library App</div>
        </footer>
      </body>
    </html>
  );
}
