import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import {
  siteName,
  siteUrl,
  siteDescription,
  defaultOgImagePath,
} from "@/lib/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultOgImage = `${siteUrl}${defaultOgImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage],
  },
  alternates: {
    canonical: siteUrl,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ?? process.env.BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.GOOGLE_SITE_VERIFICATION && {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          }),
          ...(process.env.BING_SITE_VERIFICATION && {
            other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION },
          }),
        },
      }
    : {}),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
