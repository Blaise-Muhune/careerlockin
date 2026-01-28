# SEO & AI Discovery

Production-ready SEO and AI-discovery setup for CareerLockin: classic search (Google/Bing), AI answers (AI Overviews, ChatGPT Search, Perplexity), and crawl hygiene. All via the Next.js Metadata API; no `next/head`. Zero new dependencies.

## What was implemented

### 1. Site identity (single source of truth)

- **Env:** `NEXT_PUBLIC_SITE_URL` (preferred); falls back to `NEXT_PUBLIC_APP_URL`.
- **`lib/seo/site.ts`:** `siteName`, `siteUrl`, `siteDescription`, `defaultOgImagePath`, optional `twitterHandle`.
- **`public/og.png`:** Placeholder OG image. Replace with a real 1200×630 asset for production.

### 2. Global metadata (`app/layout.tsx`)

- **metadataBase:** `new URL(siteUrl)` so relative URLs resolve correctly.
- **title:** `default: siteName`, `template: "%s | {siteName}"`.
- **description, icons, manifest:** Centralized from site config.
- **openGraph:** `type: website`, `url`, `siteName`, `title`, `description`, `images` (default og.png).
- **twitter:** `card: summary_large_image`, `title`, `description`, `images`.
- **alternates.canonical:** Default `siteUrl`; overridden per page where needed.
- **verification:** Only when env is set:
  - `GOOGLE_SITE_VERIFICATION` → `<meta name="google-site-verification" content="..." />`
  - `BING_SITE_VERIFICATION` → `<meta name="msvalidate.01" content="..." />`

### 3. Per-page metadata

- **Landing (`app/page.tsx`):** `title: "A clear roadmap to your tech career"`, description targeting “tech career roadmap”, `alternates.canonical: siteUrl`.
- **Auth routes (`app/(auth)/layout.tsx`):** `robots: "noindex, nofollow"` for `/login`, `/signup`.
- **App routes (`app/(app)/layout.tsx`):** `robots: "noindex, nofollow"` for `/dashboard`, `/roadmap`, `/settings`, `/onboarding`.
- **Admin:** `noindex` in `app/(admin)/layout.tsx` (separate from this doc).

### 4. robots.txt (`app/robots.ts`)

- **Default (`*`):** `Allow: /`, `Disallow:` `/dashboard`, `/roadmap`, `/settings`, `/onboarding`, `/login`, `/signup`, `/admin` (and trailing slash variants).
- **GPTBot:** Same allow/disallow (marketing allowed, private disallowed).
- **OAI-SearchBot:** Same.
- **sitemap:** `{siteUrl}/sitemap.xml`.
- **host:** `{siteUrl}`.

### 5. Sitemap (`app/sitemap.ts`)

Public URLs only:

- `/` (landing) — priority 1, weekly
- `/legal` — priority 0.5, monthly
- `/blog` — priority 0.6, weekly (stub index; no post URLs yet)

`lastModified` set per entry. No dashboard, auth, or admin URLs.

### 6. llms.txt (`app/llms.txt/route.ts`)

- **URL:** `GET /llms.txt` → `Content-Type: text/plain; charset=utf-8`.
- **Content:**
  - Short description of CareerLockin.
  - Public page list: landing, `/#how-it-works`, `/#pricing`, `/blog`, `/legal`.
  - **Preferred citation:** “When citing, prefer the landing page and how-it-works section.”
- **Purpose:** AI-friendly discovery and citation; no private URLs.
- **Limitations:** Optional convention; not all AI systems read it. Kept minimal and static.

### 7. Structured data (JSON-LD)

- **`lib/seo/jsonld.ts`:** Helpers to build and serialize schema objects (no user input).
- **`components/seo/LandingJsonLd.tsx`:** Renders four scripts on the landing page only:
  - **Organization:** name, url, description.
  - **WebSite:** name, url, description (no SearchAction; no in-app search).
  - **SoftwareApplication:** name, category, url, description, offers (price range).
  - **FAQPage:** 6 items (what CareerLockin does, free vs unlock vs pro, how it’s personalized, privacy, roadmap usage).
- **`defaultFaqItems`:** Real, specific answers; no buzzwords.

### 8. Answer-first content (landing)

Sections with clear headings and a short direct answer first:

- **“What is a tech career roadmap?”** — 1–2 sentences, then link to #how-it-works.
- **“How it works”** — Lead: “How this roadmap is personalized” (1–2 sentences), then the 3-step grid.
- **“What you get for free vs unlock vs pro”** — One-sentence summary, then the three cards.

### 9. Internal linking and 404

- **Flow:** Landing → #how-it-works → #pricing → /signup (nav + in-content “See pricing →”, “See how it works →”).
- **404 (`app/not-found.tsx`):** “Go to main app” → `/`, plus links to How it works, Pricing, Blog, Legal.

### 10. Open Graph and verification

- **OG image:** Default `public/og.png`; set in layout `openGraph.images` and `twitter.images`. Replace with a proper 1200×630 asset for production.
- **Verification:** Placeholders only; real codes go in env (see `.env.example`). No codes in repo.

---

## Which routes are indexed vs noindex

| Route(s) | Indexed? | Notes |
|----------|----------|--------|
| `/` | Yes | Canonical, in sitemap, allowed in robots |
| `/legal` | Yes | In sitemap |
| `/blog` | Yes | Stub index in sitemap |
| `/login`, `/signup` | No | `robots: noindex, nofollow` + disallow in robots.txt |
| `/dashboard`, `/roadmap`, `/settings`, `/onboarding` | No | Same |
| `/admin`, `/admin/*` | No | Same (admin layout) |

---

## How to test

1. **Google Rich Results Test**  
   Use the URL of your landing (e.g. `https://yoursite.com/`) and confirm Organization, WebSite, SoftwareApplication, and FAQPage are detected.

2. **Search Console sitemap**  
   Submit `https://yoursite.com/sitemap.xml` in Google Search Console (and Bing if you use it).

3. **robots.txt**  
   Open `https://yoursite.com/robots.txt` and check:
   - `Allow: /`, `Disallow:` for private paths.
   - `User-agent: GPTBot` and `User-agent: OAI-SearchBot` with same disallow list.
   - `Sitemap: https://yoursite.com/sitemap.xml`.

4. **llms.txt**  
   Open `https://yoursite.com/llms.txt` and confirm content type `text/plain` and the listed public URLs + preferred citation.

---

## AI crawlers (GPTBot, OAI-SearchBot)

- **GPTBot:** Training data. Disallowing it keeps your content out of future training; allowing it can improve model knowledge of your product.
- **OAI-SearchBot:** ChatGPT search (and similar). Allowing it helps your site appear in search-style answers; disallowing prevents that.
- Both are controlled via `app/robots.ts` with the same allow/disallow list as the default `*` bot. Private paths are disallowed; marketing and public content are allowed.

---

## llms.txt purpose and limitations

- **Purpose:** Optional, human- and model-readable list of public pages and a preferred citation line. Aims to make AI answers more accurate and citable.
- **Limitations:** Not all tools or models read it; it’s best used together with clear on-page content, JSON-LD, and good metadata. Content is static (no user-specific or private URLs).

---

## Files created or updated

| Purpose | Path |
|--------|------|
| Site identity | `lib/seo/site.ts` |
| JSON-LD helpers + default FAQ | `lib/seo/jsonld.ts` |
| Landing JSON-LD scripts | `components/seo/LandingJsonLd.tsx` |
| Global metadata | `app/layout.tsx` |
| Landing metadata + answer-first content | `app/page.tsx` |
| Auth noindex | `app/(auth)/layout.tsx` |
| App noindex | `app/(app)/layout.tsx` |
| robots.txt | `app/robots.ts` |
| Sitemap | `app/sitemap.ts` |
| llms.txt | `app/llms.txt/route.ts` |
| Blog stub | `app/blog/page.tsx` |
| 404 + marketing links | `app/not-found.tsx` |
| OG placeholder | `public/og.png` |
| Env / verification | `.env.example` |
| This doc | `docs/seo-ai.md` |
