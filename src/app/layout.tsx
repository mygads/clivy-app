import type { Metadata } from "next";
import type React from "react";
import "@/app/globals.css";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.genfity.com'),
  title: {
    template: '%s | GENFITY Digital Solutions',
    default: "GENFITY - Digital Solutions & Software House",
  },
  description: "GENFITY Digital Solutions adalah software house dan digital agency yang menyediakan layanan pengembangan aplikasi, integrasi WhatsApp API, serta solusi customer service AI berbasis WhatsApp untuk bisnis Anda.",
  applicationName: "GENFITY",
  authors: [
    { name: "PT Generation Infinity Indonesia", url: "https://www.genfity.com" }
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
    url: "https://www.genfity.com",
    title: "GENFITY - Digital Solutions & Software House",
    description: "Software house dan digital agency terpercaya untuk solusi digital bisnis Anda",
    siteName: "GENFITY Digital Solutions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GENFITY Digital Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GENFITY - Digital Solutions & Software House",
    description: "Software house dan digital agency terpercaya untuk solusi digital bisnis Anda",
    images: ["/og-image.png"],
    creator: "@genfity",
  },
  alternates: {
    canonical: "https://www.genfity.com",
    languages: {
      "id-ID": "https://www.genfity.com/id",
      "en-US": "https://www.genfity.com/en",
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
