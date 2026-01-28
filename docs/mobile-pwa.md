# Mobile & PWA

## Mobile UX principles

- **Touch targets ≥ 44px** for primary actions (buttons, nav, step rows).
- **No dense tables** on small screens; cards stack in a single column.
- **Important actions** (Add time, Start step, Resume) are reachable with one hand; primary CTAs use `min-h-[44px]` and `touch-manipulation`.
- **No horizontal scrolling**; main content uses `overflow-x-hidden` and `min-w-0` where needed.
- **Spacing** is slightly larger on touch (e.g. step rows, modal footer) to avoid mis-taps.

## Navigation on mobile

- **&lt; md:** Hamburger menu; tap opens a full-screen sheet with Dashboard, Roadmap, Settings, Log out. Each item has at least 48px height.
- **≥ md:** Inline nav links with 44px touch targets.

## Step modal on mobile

- **Width:** Full-width on mobile (`w-[calc(100vw-2rem)]`), standard max-width on desktop.
- **Height:** Up to `90dvh` on mobile so the modal doesn’t overflow; body scrolls inside.
- **Footer:** Sticky at the bottom with primary actions (Start, Resume, Pause, Complete). All buttons use `min-h-[44px]` and `touch-manipulation`.
- **Close:** Header close (X) remains in place; tap outside also closes.

## PWA capabilities

- **manifest.json** in `public/`: name, short_name, display `standalone`, theme_color, background_color, start_url `/dashboard`, single icon (favicon) as placeholder.
- **Meta / viewport:** Root layout sets `manifest`, `themeColor`, `appleWebApp`, and viewport (themeColor, width, scale).
- **Service worker:** Minimal `public/sw.js` (install + activate, no caching) for installability. Registered only on HTTPS or localhost via `RegisterSW` in the root layout.
- **Install:** Rely on the browser’s native “Add to Home Screen” / “Install app”; no custom install prompts or banners.

## Offline behavior

- **Detection:** Client component `OfflineBanner` listens to `online` / `offline` and shows a short message when offline: “You're offline. Some actions may be unavailable.”
- **Banner:** Shown at the top of the app shell when offline; uses amber styling so it’s noticeable but not loud.
- **Write actions:** Not automatically disabled in code; the message tells users that some actions may be unavailable. Fully disabling writes would require a shared offline state (e.g. context) and wiring each form/button to it.

## Limitations

- **No offline cache:** The service worker does not cache routes or API responses. Offline, previously loaded pages may show until refresh; new navigation or mutation will fail without network.
- **No install prompt:** The app does not show an in-app “Install app” banner; users use the browser’s own install entry point.
- **Charts on small screens:** Recharts and layout are responsive; very small viewports may feel tight but remain usable without extra mobile-specific chart logic.

## Files

- **Layout/nav:** `components/layout/AppShell.tsx`, `components/layout/AppNav.tsx`
- **Step modal:** `app/(app)/roadmap/step-detail-modal.tsx`
- **Step row:** `app/(app)/roadmap/step-row.tsx`
- **PWA:** `public/manifest.json`, `public/sw.js`, `components/pwa/RegisterSW.tsx`, `app/layout.tsx` (metadata + viewport)
- **Offline:** `components/pwa/OfflineBanner.tsx`, included in `AppShell`
