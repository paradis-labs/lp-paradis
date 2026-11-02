import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes (`/api/cms/revalidate`)
  // - Next.js internals (_next)
  // - Static files (files with extensions)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
