# Auth & protected app flow

## Routes

| Route | Access |
|-------|--------|
| `/` | Redirects: no user → `/login`; user, no profile → `/onboarding`; user + profile → `/dashboard`. |
| `/login` | Public. Email + password or Google OAuth. |
| `/signup` | Public. Email + password or Google OAuth. |
| `/auth/callback` | OAuth callback; exchanges code for session, redirects to `/dashboard`. |
| `/onboarding` | Requires login. If user has a profile, redirects to `/dashboard`. |
| `/dashboard` | Requires login and profile. If no profile, redirects to `/onboarding`. |

## Redirect rules (plain language)

1. **No session**  
   Any request under `(app)` (e.g. `/dashboard`, `/onboarding`) or `/` → redirect to `/login`.

2. **Session but no profile**  
   Request to `/dashboard` (or any route that requires a profile) → redirect to `/onboarding`.  
   Request to `/` → redirect to `/onboarding`.

3. **Session and profile**  
   Request to `/onboarding` → redirect to `/dashboard`.  
   Request to `/` → redirect to `/dashboard`.

4. **After actions**  
   - **Sign up** → redirect to `/onboarding` (new user has no profile).  
   - **Log in** → redirect to `/dashboard` (layout then sends to `/onboarding` if no profile).  
   - **Complete onboarding** → redirect to `/dashboard`.  
   - **Log out** → redirect to `/login`.

## Required environment variables

Same as Supabase setup (see `docs/supabase.md`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; not used in auth UI)

## Where session is enforced

- **`app/(app)/layout.tsx`**  
  Calls `requireUser()`. Unauthenticated users hitting any `(app)` route are redirected to `/login`.

- **`app/(app)/dashboard/layout.tsx`**  
  Calls `requireUserAndProfile()`. Authenticated users without a profile are redirected to `/onboarding`.

- **`app/(app)/onboarding/page.tsx`**  
  Calls `requireUserForOnboarding()`. Unauthenticated users go to `/login`; users who already have a profile go to `/dashboard`.

- **`app/page.tsx`**  
  Uses `getAuthState()` and redirects based on user and profile (see “Routes” above).

- **Server Actions**  
  - `signUp` / `signIn`: use Supabase server client; redirect after success.  
  - `signInWithGoogle`: returns OAuth URL; client redirects to Google, then Supabase redirects to `/auth/callback`.  
  - `submitOnboarding`: uses `requireUserForOnboarding()` and upserts `profiles` for the current user (target_role, weekly_hours, current_level, goal_intent, target_timeline_weeks, prior_exposure, learning_preference).  
  - `logout`: calls `supabase.auth.signOut()` then redirects to `/login`.

## Google OAuth

1. **Supabase Dashboard**  
   - Authentication → Providers: enable **Google** and add your Google OAuth Client ID and Client Secret (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).  
   - Authentication → URL Configuration: add your app callback URL to **Redirect URLs**, e.g. `https://yourdomain.com/auth/callback` and `http://localhost:3000/auth/callback` for local dev.

2. **Google Cloud Console**  
   - Authorized JavaScript origins: your site URL (and `http://localhost:3000` for dev).  
   - Authorized redirect URIs: use the Supabase callback shown in the Dashboard (e.g. `https://<project-ref>.supabase.co/auth/v1/callback`).

3. **Flow**  
   - User clicks “Continue with Google” on `/login` or `/signup` → server action returns Supabase OAuth URL → client redirects to Google → after consent, Supabase redirects to `/auth/callback?code=...` → route handler exchanges code for session and redirects to `/dashboard`. New users without a profile are sent to `/onboarding` by the dashboard layout.

Session refresh is handled in **Next.js middleware** (`middleware.ts`), which delegates to `@/lib/supabase/middleware.updateSession` so cookies stay in sync for server-rendered pages and Server Actions.
