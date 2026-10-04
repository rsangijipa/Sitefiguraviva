import { MetadataRoute } from "next";

import { getPublicSiteOrigin } from "@/lib/public-site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/portal/", "/api/"],
    },
    sitemap: `${getPublicSiteOrigin()}/sitemap.xml`,
  };
}
