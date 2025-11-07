import type { Metadata } from "next";
import type React from "react";
import "@/app/globals.css";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clivy.com'),
  title: {
    template: '%s | CLIVY WhatsApp API Services',
    default: "CLIVY - WhatsApp API Services & Software House",
  },
  description: "CLIVY WhatsApp API Services adalah software house dan digital agency yang menyediakan layanan pengembangan aplikasi, integrasi WhatsApp API, serta solusi customer service AI berbasis WhatsApp untuk bisnis Anda.",
  applicationName: "CLIVY",
  authors: [
    { name: "PT Generation Infinity Indonesia", url: "https://www.clivy.com" }
  ],
  generator: "Next.js",
  keywords: [
    "software house",
    "digital agency", 
    "whatsapp api",
    "whatsapp business",
    "customer service ai",
    "aplikasi mobile",
    "web development",
    "digital marketing"
  ],
  referrer: "origin-when-cross-origin",
  creator: "Muhammad Yoga Adi Saputra",
  publisher: "PT Generation Infinity Indonesia",
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
    url: "https://www.clivy.com",
    title: "CLIVY - WhatsApp API Services & Software House",
    description: "Software house dan digital agency terpercaya untuk solusi digital bisnis Anda",
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
    title: "CLIVY - WhatsApp API Services & Software House",
    description: "Software house dan digital agency terpercaya untuk solusi digital bisnis Anda",
    images: ["/og-image.png"],
    creator: "@clivy",
  },
  alternates: {
    canonical: "https://www.clivy.com",
    languages: {
      "id-ID": "https://www.clivy.com/id",
      "en-US": "https://www.clivy.com/en",
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
