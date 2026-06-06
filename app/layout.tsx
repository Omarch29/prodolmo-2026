import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Títulos / marcadores — fuente pixel display
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Numerales grandes legibles (marcadores, contadores)
const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Cuerpo / UI
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRODE Mundial 2026",
  description: "Prode del Mundial 2026 — pronosticá, sumá puntos y ganale a tus amigos.",
};

export const viewport: Viewport = {
  themeColor: "#161b22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${pressStart.variable} ${vt323.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
