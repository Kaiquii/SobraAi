import type { Metadata, Viewport } from "next";
import { Providers } from "@/app/providers";
import { themeBootstrapScript } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SobraAi Admin",
    template: "%s | SobraAi Admin",
  },
  description: "Painel administrativo do SobraAi.",
  icons: {
    icon: [
      { url: "/brand/sobra-ai-admin-favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/sobra-ai-admin-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/sobra-ai-admin-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f8" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  userScalable: false,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Executar durante a leitura do HTML, antes da montagem da página. */}
        <script
          id="sobra-ai-admin-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
