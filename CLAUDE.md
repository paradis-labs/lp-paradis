# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — production build (`output: "standalone"`, used by the Dockerfile)
- `npm run start` — run the built app
- `npm run lint` — Biome check (lint + import organization)
- `npm run format` — Biome format with `--write`
- `npm run cms:check` — read-only check that the hcms still has the shape the site depends on (`cms/hcms/check-contract.ts`)
- `npm run cms:revalidate -- <site url>` — revalidate every content cache tag of a running site through its revalidate endpoint (`cms/revalidate-all.ts`)

No test runner is configured. The only verification surface is a **dev-only fixture route** at `/[locale]/fixtures/footer` (`src/app/(app)/[locale]/fixtures/footer/page.tsx`): it renders `Footer` with hand-made props to exercise degraded content states, and calls `notFound()` unless `NODE_ENV === "development"`. Add fixtures there rather than reaching for a test framework, and keep the production guard first in the component body.

## Architecture

Next.js 16 App Router site whose content comes from the **hcms** (`hcms.paradis.host`): a Directus 11 instance shared by several sites, read with `@directus/sdk`. Localized to English/Portuguese with **next-intl**. React 19 with the React Compiler and **Cache Components** (`cacheComponents: true`) enabled (`next.config.ts`).

### Routes under `src/app/`
- `(app)/[locale]/` — the public site. Every page is locale-prefixed (`/en`, `/pt`) and prerendered (`generateStaticParams` in the layout). A first segment that is not a locale (paths the proxy skips, like `/api/...` or a missing file) is a 404 through `requireLocale()` (`src/i18n/require-locale.ts`), called by every entry point that reads the locale: the layout, pages and `@footer` slot leaves render in parallel, and `dynamicParams = false` is not allowed with Cache Components.
- `api/cms/revalidate/route.ts` — cache invalidation called by the hcms (see Data fetching).

`next.config.ts` wraps the config in `withNextIntl` and allows the hcms host in `images.remotePatterns`.

### Content model (in the hcms, not in this repo)
- The hcms is a page builder: a **site** (`paradis`) has **pages** made of ordered **blocks**. The site keeps the page composition in code and uses the blocks only as content: pages are chosen by `key` with fixed routes (`home` → `/`, `contact` → `/get-quote`), and blocks are found by collection + anchor (`block_hero`, `block_media_text #about-us`, `block_collection #services/#products/#testimonials/#faqs`, `block_form`, `block_contact`); `hide_block` turns a section off.
- Navbar and footer come from `navigations` (`header`, `header_actions`, `footer_columns`, `footer_actions`) and the `sites` item (logos, tagline, copyright, e-mail, social links). The quote form is `forms` key `quote_request`, and its options are the site's `offerings`.
- The model and the sample content are owned by the `Template-multisite-tenant` repo (`tooling/seed/paradis.mjs`). **Never write to the hcms schema from this repo.** The field-by-field mapping is in `openspec/changes/cms-phase-1-hcms-alignment/design.md` (with the `#about-us`/`#services` correction noted in `src/content/providers/hcms.ts`).
- To expose a new field: add it to the domain type in `src/content/types.ts`, then read and validate it in `src/content/providers/hcms.ts` — components never see the raw hcms shape.

### Data fetching (`src/content/`)
- **All content access goes through `@/content`** — pages, layouts, `@footer` slot leaves and Server Actions call `getNavBar` / `getFooter` / `getContact` / `getHomepage` / `getQuotePage` / `isQuoteFormEnabled` / `findServicesBySlugs` / `createQuoteRequest`. Biome's `noRestrictedImports` rejects `@directus/sdk` anywhere except `src/content/providers/` and `cms/hcms/`.
- `types.ts` holds the **domain types**, shaped by what the UI consumes and independent of the CMS: no CMS ids in the UI (an opaque `key: string` instead), relations arrive populated, lists are always arrays, `T | null` only where an editor may leave a field empty. Rich text is sanitized HTML (`RichText`, produced only by `rich-text.ts`; FAQ answers are Markdown in the hcms, converted with `marked`); media is `{ url, alt, width, height }` with `url` already `${CMS_URL}/assets/<id>/<filename>` (the filename keeps SVGs out of the image optimizer, which rejects them).
- `providers/hcms.ts` is the only reader/writer of the hcms: `TOKEN_SECRET_READ` reads, `TOKEN_SECRET_FORM` only creates `form_submissions` (`form` id, `site`, `languages_code`, `data`). It validates every raw response with zod and maps it to the domain: `en`↔`en-US` / `pt`↔`pt-AO` with field-by-field fallback to `en-US`, service slugs always the `en-US` one, authored URLs stripped of the locale prefix. Transport errors and a missing site/page/form throw; an invalid list item is dropped and logged (`[content] item inválido descartado`) while the rest renders.
- **Reads are cached in `index.ts`** with `"use cache"` + `cacheTag` + `cacheLife({ revalidate: 1 h })`, one function per read (a `"use cache"` scope puts what it captures in the key, and a captured function is not serializable). Tags come from `cache-tags.ts` (`cms:<read>`, `cms:<read>:<locale>`, `cms:collection:<name>`). `isQuoteFormEnabled` and the writes are deliberately uncached. The cache is per instance: several replicas would need a shared `cacheHandlers` (see the self-hosting guide).
- **Invalidation:** the hcms template's "Revalidate site" flow POSTs every content change to the site's `revalidate_url` → `POST /api/cms/revalidate`, header `x-revalidate-secret` = `CMS_REVALIDATE_SECRET`, body `{ site, event, collection, keys }`. `hcmsCollectionTags` in `cache-tags.ts` maps the hcms collection to the tags (`revalidateTag(tag, { expire: 0 })`); an unmapped collection answers 200 with nothing invalidated, another `site` answers 400. Setup in `cms/hcms/FLOW.md`.

### i18n
- `src/i18n/routing.ts` — locales `['en','pt']`, default `en`. `request.ts` (server config) and `navigation.ts` (locale-aware `Link`/`redirect`/`useRouter`) wrap next-intl. UI copy that does not come from the CMS lives in components as `Record<Locale, …>` (badges, fallbacks); there are no next-intl message files, on purpose (`src/lib/locale-href.ts`).
- Routing middleware lives in **`src/proxy.ts`** (Next.js 16's renamed `middleware`), and excludes `_next`, `api` and static files from locale handling.

### UI
- shadcn/ui ("new-york" style, RSC) with components in `src/components/ui/`; the `@magicui` registry is also configured (`components.json`). Tailwind v4 (via `@tailwindcss/postcss`), `lucide-react` + `@solar-icons/react` icons, `motion` for animation.
- Feature components live in `src/components/<Name>/index.tsx`. Custom `Gilroy` font in `src/fonts/`.
- Use the `cn` helper from `src/lib/utils.ts` for class merging.
- With Cache Components, a bare `new Date()` or another unstable value in a prerendered page fails the build: put it in a `"use cache"` scope (as the footer's copyright year does) or a client leaf.

## Conventions
- Path alias: `@/*` → `src/*`.
- Formatting/linting is **Biome** (`biome.json`), not ESLint/Prettier: 2-space indent, import organization on. Run `npm run lint` before committing.
- Required env vars (see `.env`): `CMS_URL`, `TOKEN_SECRET_READ` (read-only), `TOKEN_SECRET_FORM` (only `create` on `form_submissions`) and `CMS_REVALIDATE_SECRET`. Without the first three the site refuses to start.
- **History:** the site ran on Payload CMS until `migrate-cms-to-directus` (phases 0a–5 in `openspec/changes/`). The phase-4 runbook (`cms/CUTOVER.md`) and the migration scripts removed in phase 5 (in git at `c7e1d20`, see `cms/hcms/README.md`) document how it moved.

## Deployment
Multi-stage `Dockerfile` (Node 24 alpine, lockfile-agnostic) builds the Next.js standalone output and runs `node server.js` as a non-root user. `sharp` for `next/image` comes from `next`'s own optional dependency.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
