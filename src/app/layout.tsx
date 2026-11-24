import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://bibliotecadepacks.com.br'
  ),
  title: "Biblioteca de Packs — Artes Editáveis",
  description: "Acesse seus packs de artes editáveis para Canva e Photoshop. Designs profissionais prontos para personalizar.",
  keywords: ["packs", "artes editáveis", "canva", "photoshop", "design", "social media"],
  openGraph: {
    title: "Biblioteca de Packs — Artes Editáveis",
    description: "Acesse seus packs de artes editáveis para Canva e Photoshop. Designs profissionais prontos para personalizar.",
    images: [
      {
        url: '/sales-pages/provedor-v2/versao-cover-1.png',
        width: 980,
        height: 745,
        alt: 'Biblioteca de Packs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/sales-pages/provedor-v2/versao-cover-1.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
