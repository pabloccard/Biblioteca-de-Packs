import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biblioteca de Packs — Artes Editáveis",
  description: "Acesse seus packs de artes editáveis para Canva e Photoshop. Designs profissionais prontos para personalizar.",
  keywords: ["packs", "artes editáveis", "canva", "photoshop", "design", "social media"],
  openGraph: {
    title: "Biblioteca de Packs — Artes Editáveis",
    description: "Acesse seus packs de artes editáveis para Canva e Photoshop. Designs profissionais prontos para personalizar.",
    images: [
      {
        url: '/herocover.png',
        width: 1200,
        height: 630,
        alt: 'Preview Biblioteca de Packs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/herocover.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: '#0A0A0A',
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
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
