import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { Providers } from "@/app/providers";
import { parseTheme, THEME_BACKGROUND, THEME_COOKIE_NAME, themeBootstrapScript } from "@/lib/theme";

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
    { media: "(prefers-color-scheme: light)", color: THEME_BACKGROUND.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_BACKGROUND.dark },
  ],
  userScalable: false,
  width: "device-width",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE_NAME)?.value);

  return (
    <html
      lang="pt-BR"
      className={theme === "dark" ? "h-full dark" : "h-full"}
      data-theme-preference={theme}
      style={theme ? { colorScheme: theme, backgroundColor: THEME_BACKGROUND[theme] } : undefined}
      suppressHydrationWarning
    >
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
