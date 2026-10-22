import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // En mode démo, on évite d'indexer une carte fictive.
  if (site.demoMode) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/commande"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
