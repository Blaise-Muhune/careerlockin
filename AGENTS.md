# Project Instructions (read first)

Build a Next.js (App Router) SaaS that:
- Authenticates users (Supabase Auth)
- Collects onboarding info (skills, target role, weekly hours)
- Generates a career roadmap via LLM as strict JSON
- Stores roadmap + steps in Postgres (Supabase) with RLS
- Tracks progress (checklists, weekly check-ins)
- Uses Stripe subscriptions to gate paid features

Non-negotiables:
- TypeScript strict. No `any` without justification.
- Validate all inputs with Zod on the server.
- Lint/typecheck must pass before considering work done.
- No placeholder auth, billing, or database logic.
