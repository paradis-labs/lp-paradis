import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// As imagens do hcms chegam como `${CMS_URL}/assets/<id>/<nome>` e passam pelo
// `next/image`, que só aceita hosts declarados. O default cobre um build sem
// `CMS_URL` no ambiente.
const cmsUrl = new URL(process.env.CMS_URL || "https://hcms.paradis.host");

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: cmsUrl.protocol === "http:" ? "http" : "https",
        hostname: cmsUrl.hostname,
        port: cmsUrl.port,
        pathname: "/assets/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
