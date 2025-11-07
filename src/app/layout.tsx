import type { Metadata } from "next";
import type React from "react";
import "@/app/globals.css";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clivy.vercel.app'),
  title: {
    template: '%s | CLIVY WhatsApp API Services',
    default: "CLIVY - WhatsApp API Services",
  },
  description: "CLIVY WhatsApp API Services adalah solusi digital untuk bisnis Anda.",
  applicationName: "CLIVY",
  authors: [
    { name: "Clivy App", url: "https://www.clivy.vercel.app" }
  ],
  generator: "Next.js",
  keywords: [
    "clivy",
    "whatsapp api services",
    "whatsapp business api",
    "whatsapp api",
    "whatsapp business",
    "customer service ai",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Muhammad Yoga Adi Saputra",
  publisher: "Clivy App",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/web-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/web-icon.svg",
    apple: [
      { url: "/web-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/web-icon.svg",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.clivy.vercel.app",
    title: "CLIVY - WhatsApp API Services",
    description: "Whatsapp API Services untuk solusi digital bisnis Anda",
    siteName: "CLIVY WhatsApp API Services",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CLIVY WhatsApp API Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLIVY - WhatsApp API Services",
    description: "Whatsapp API Services untuk solusi digital bisnis Anda",
    images: ["/og-image.png"],
    creator: "@clivy",
  },
  alternates: {
    canonical: "https://www.clivy.vercel.app",
    languages: {
      "id-ID": "https://www.clivy.vercel.app/id",
      "en-US": "https://www.clivy.vercel.app/en",
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
