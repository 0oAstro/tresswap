import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/contact/"],
      disallow: ["/api/", "/auth/callback", "/login/", "/swap/", "/history/"],
    },
    sitemap: "https://tresswap.vercel.app/sitemap.xml",
  };
}
