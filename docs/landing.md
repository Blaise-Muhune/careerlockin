# Landing Page

This doc explains positioning, copy tone, and audience for the marketing landing page at `/`.

## Positioning (5 bullets)

1. **Clarity over overload.** CareerLockin is for people who feel lost in “what to learn next.” The offer is a single, personalized plan—not another feed or course pile.

2. **Three clear access levels.** Free = roadmap + Phase 1 + preview of rest. One-time unlock = full plan, all phases, lifetime access. Pro = everything + tracking, time logs, insights, and updates. No hype; value is spelled out.

3. **Progress is optional.** The hero and “How it works” stress that you can “track progress or just follow the plan.” We’re not selling commitment—we’re selling a clear path. Tracking is for people who want it.

4. **Human, not AI-forward.** Copy avoids “AI will change your life” and similar buzz. The product helps you get a plan and optionally track it. Calm, direct, confident.

5. **Built for specific people.** “Built for people who want clarity” names students, career switchers, self-taught developers, and busy professionals. We don’t claim to be for everyone; we’re for people who want one clear roadmap.

## Copy tone rules

- **Calm.** No urgency, countdowns, or “limited time.”
- **Confident.** Short sentences. Clear value. No hedging.
- **Direct.** Say what the product does and who it’s for. No filler.
- **No hype.** No “revolutionary,” “game-changing,” or “AI-powered” as a selling line.
- **No fake social proof.** We use “Built for…” bullets, not invented testimonials or logos.

## Who this page is for

- Aspiring and early-stage tech career builders who don’t know what to learn next.
- Career switchers who need a structured path into a new role.
- Self-taught learners who feel overwhelmed by options and want one plan.
- Busy professionals who have limited hours and want a plan that fits their time.

## Who this page is not for

- People looking for a course marketplace or learning community.
- People who want “AI to plan everything” or fully automated learning.
- People who already have a clear curriculum and don’t need a roadmap.
- Enterprise or team buyers (this page speaks to individuals).

## Structure

1. **Hero.** Headline + “No guessing. No overload.” + one-sentence value + primary CTA (“Create my roadmap”) + secondary (“See how it works”).
2. **How it works.** Three steps: goal/time → roadmap → track or follow.
3. **What you get.** Three columns: Free, One-time unlock, Pro. Bullets only; no prices in this section.
4. **Built for.** Four bullets (students, career switchers, self-taught developers, busy professionals). No testimonials.
5. **Pricing.** Free / One-time ($19.99) / Pro ($9.99/month) cards. Calm copy; no countdowns.
6. **Final CTA.** “Stop guessing what to learn next.” + “Create my roadmap.”

## Technical notes

- Route: `app/page.tsx`. Logged-in users with a profile are redirected to `/dashboard`; those without a profile go to `/onboarding`.
- Shell: `LandingShell` (header only: logo, How it works, Pricing, Sign in, primary CTA). Same visual style as AppShell (sticky header, border, max-width) but no app nav.
- SEO: `metadata.title` and `metadata.description` are set on the page. No background videos or loud gradients; layout is responsive and scannable.
