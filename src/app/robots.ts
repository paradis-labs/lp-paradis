import type { MetadataRoute } from "next";
import { getSiteSeo } from "@/content";

// Tudo indexável, com o sitemap (`seo-metadata`). Sem o `frontend_url` do site
// não há URL absoluto para o sitemap, e a linha fica de fora.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { baseUrl } = await getSiteSeo("en");
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  };
}
