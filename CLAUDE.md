# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000; Payload admin at /admin)
- `npm run build` — production build (`output: "standalone"`, used by the Dockerfile)
- `npm run start` — run the built app
- `npm run lint` — Biome check (lint + import organization)
- `npm run format` — Biome format with `--write`
- `npx payload generate:types` — regenerate `payload-types.ts` after any change to a collection/global schema

No test runner is configured. The only verification surface is a **dev-only fixture route** at `/[locale]/fixtures/footer` (`src/app/(app)/[locale]/fixtures/footer/page.tsx`): it renders `Footer` with hand-made props to exercise degraded content states, and calls `notFound()` unless `NODE_ENV === "development"`. Add fixtures there rather than reaching for a test framework, and keep the production guard first in the component body.

## Architecture

Next.js 16 App Router site whose content is fully driven by **Payload CMS 3** (Postgres + S3 media), localized to English/Portuguese with **next-intl**. React 19 with the React Compiler enabled (`next.config.ts`).

### Two route groups under `src/app/`
- `(app)/[locale]/` — the public marketing site. Every route is locale-prefixed (`/en`, `/pt`).
- `(payload)/` — Payload's admin UI (`/admin`) and REST/GraphQL API (`/api`). These are generated Payload routes; avoid hand-editing files under `(payload)/admin` and the `api` route handlers.

`next.config.ts` composes the plugins: `withNextIntl(withPayload(nextConfig))`. Both wrappers are required.

### Content model (`src/collections/`, registered in `src/payload.config.ts`)
- The **homepage is a Payload Global** (`HomePage.ts`, slug `homepage`) in `src/collections/pages/`. It is the source of truth for page composition: each section (hero, services, projects, testimonials, faqs, contact) is a `group` with an `enabled` flag plus `relationship` fields pointing at collections.
- **Collections** (`Media`, `Hero`, `Contact`, `Projects`, `Services`, `Testimonials`, `FAQs`) hold the reusable content referenced by the homepage global.
- Other **Globals**: `Menu` (NavBar) and `Footer` in `src/collections/globals/`.
- To add/extend a section: edit the collection (or the relevant group in `HomePage.ts`), register new collections in `payload.config.ts`, run `npx payload generate:types`, then expose the field through the domain type in `src/content/types.ts` and its zod schema + mapping in `src/content/providers/payload.ts` — components never see the generated types.

### Data fetching (`src/content/`)
- **All content access goes through `@/content`** — pages, layouts, `@footer` slot leaves and Server Actions call `getNavBar` / `getFooter` / `getContact` / `getHomepage` / `getQuotePage` / `isQuoteFormEnabled` / `findServicesBySlugs` / `createQuoteRequest`. Biome's `noRestrictedImports` rejects `payload`, `@payloadcms/*`, `@payload-config` and `payload-types` anywhere except `src/content/providers/`, `src/collections/`, `src/payload.config.ts`, `src/app/(payload)/` and `next.config.ts`.
- `types.ts` holds the **domain types**, shaped by what the UI consumes and independent of the CMS: no numeric ids (an opaque `key: string` instead), relations arrive populated, lists are always arrays, `T | null` only where an editor may leave a field empty. Rich text is sanitized HTML (`RichText`, produced only by `rich-text.ts`); media is `{ url, alt, width, height }` with `url` already resolved (`/cdn/<key>` from Payload, `${CMS_URL}/assets/<id>/<filename>` from the hcms; the filename keeps SVGs out of the image optimizer, which rejects them).
- `providers/payload.ts` is the only reader/writer of the Payload Local API: it owns the memoized `getPayloadInstance()`, validates every raw response with zod, and maps it to the domain. Transport errors and invalid globals throw; an invalid list item is dropped and logged (`[content] item inválido descartado`) while the rest renders.
- **Reads are cached in `index.ts`** with `unstable_cache` (not `"use cache"`: that needs `cacheComponents`, which would also change the in-process Payload admin — deferred to the phase that removes Payload). Keys include the locale; tags come from `cache-tags.ts` (`cms:<read>`, `cms:<read>:<locale>`, `cms:collection:<name>`), with a 1-hour max age as a safety net. `isQuoteFormEnabled` and the writes are deliberately uncached. Payload `afterChange`/`afterDelete` hooks in `src/collections/hooks/revalidate.ts` call `revalidateTag(tag, "max")` on save — provisional until Directus takes over invalidation. The cache is per instance (memory + `.next` on disk): running several replicas would need a shared `cacheHandlers` (see the self-hosting guide).
- **Two providers behind the same functions**, chosen once in `index.ts` by `CMS_PROVIDER` (`payload` | `hcms`, default `payload`; an invalid value, or `hcms` without its env vars, throws at module load). `providers/hcms.ts` reads the shared Directus (`hcms.paradis.host`, site `paradis`) with `@directus/sdk`: pages by `key` with fixed routes (`home` → `/`, `contact` → `/get-quote`), blocks by collection + anchor (`hide_block` → `enabled: false`), `en`↔`en-US` / `pt`↔`pt-AO` with field-by-field fallback to `en-US`, service slugs always the `en-US` one. The provider name is part of the cache key (not the tags), so switching never serves the other CMS's entries. `npm run cms:parity` diffs the two providers' domain objects (uncached, `en` + `pt`). The variable is transitional (`migrate-cms-to-directus`, phase 5 removes Payload). The raw generated types live in `payload-types.ts` (do not edit by hand) and are imported only by the Payload provider.
- **hcms invalidation:** `POST /api/cms/revalidate` (`src/app/api/cms/revalidate/route.ts`), header `x-revalidate-secret` = `CMS_REVALIDATE_SECRET`, body `{ site, event, collection, keys }`; `hcmsCollectionTags` in `cache-tags.ts` maps the hcms collection to the same tags (`{ expire: 0 }`, immediate); an unmapped collection answers 200 with nothing invalidated. It is called by the hcms template's own "Revalidate site" flow, configured by filling `revalidate_url`/`revalidate_secret` on the Paradis site item (`cms/hcms/FLOW.md`).

### i18n
- `src/i18n/routing.ts` — locales `['en','pt']`, default `en`. `request.ts` (server config) and `navigation.ts` (locale-aware `Link`/`redirect`/`useRouter`) wrap next-intl.
- Routing middleware lives in **`src/proxy.ts`** (Next.js 16's renamed `middleware`), and excludes `_next`, `api`, `admin`, and static files from locale handling.
- Payload has its own `localization` config (pt/en) in `payload.config.ts`, separate from next-intl; fields marked `localized: true` are translated per-locale in the CMS.

### UI
- shadcn/ui ("new-york" style, RSC) with components in `src/components/ui/`; the `@magicui` registry is also configured (`components.json`). Tailwind v4 (via `@tailwindcss/postcss`), `lucide-react` + `@solar-icons/react` icons, `motion` for animation.
- Feature components live in `src/components/<Name>/index.tsx`. Custom `Gilroy` font in `src/fonts/`.
- Use the `cn` helper from `src/lib/utils.ts` for class merging.

## Conventions
- Path aliases: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`.
- Formatting/linting is **Biome** (`biome.json`), not ESLint/Prettier: 2-space indent, import organization on. Run `npm run lint` before committing.
- Required env vars (see `.env`): `DATABASE_URL`, `PAYLOAD_SECRET`, and `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_REGION` / `S3_BUCKET` / `S3_ENDPOINT` for media storage.
- **Migration target — the hcms** (`hcms.paradis.host`, a Directus instance shared by several sites): `CMS_URL`, `TOKEN_SECRET_READ` (read-only) and `TOKEN_SECRET_FORM` (only `create` on `form_submissions`), plus `CMS_PROVIDER` and `CMS_REVALIDATE_SECRET`. Never write to its schema from this repo. `npm run cms:check` verifies, read-only, that the hcms still has the shape the site depends on; `npm run cms:verify` compares its content with Payload's (placeholders, missing translations, field-by-field differences, exceptions in `cms/hcms/accepted-differences.json`); see `cms/hcms/README.md`.
- **Cutover** (`cms/CUTOVER.md`): `PAYLOAD_READ_ONLY=true` freezes Payload content writes (`src/collections/access.ts`; `quote-requests` and `users` stay writable, and the form writes with `overrideAccess`). Runbook commands: `cms:revalidate -- <url>` (every mapped collection through the revalidate endpoint), `cms:export-leads -- <file outside the repo>` (old leads as CSV; personal data), `cms:import-submissions -- <export.json> [verificar]` (hcms `form_submissions` export → `quote-requests`, idempotent by email + message + `createdAt`). Payload has **no migrations** here: its schema reaches the DB only through the dev-mode push, so a new Payload field must exist in the production DB before the code that uses it is deployed. The `cms/` scripts that use the Local API set `PAYLOAD_MIGRATING=true` so they never push.

## Deployment
Multi-stage `Dockerfile` (Node 24 alpine, lockfile-agnostic) builds the Next.js standalone output and runs `node server.js` as a non-root user.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
