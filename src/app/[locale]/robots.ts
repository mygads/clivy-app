import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/payment/",
          "/verify-email/",
          "/_next/",
          "/private/",
        ],
      },
      // Specific rules for Google Bot
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/og"],
        disallow: [
          "/api/",
          "/dashboard/", 
          "/admin/",
          "/payment/",
          "/verify-email/",
          "/_next/",
          "/private/",
        ],
      },
      // Allow specific bots for SEO tools
      {
        userAgent: ["Bingbot", "Slurp", "DuckDuckBot"],
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/", 
          "/payment/",
          "/verify-email/",
          "/_next/",
          "/private/",
        ],
      }
    ],
    sitemap: "https://www.genfity.com/sitemap.xml",
    host: "www.genfity.com",
  };
}
