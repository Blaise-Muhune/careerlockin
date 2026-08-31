# Networking Support

CareerLockin includes lightweight networking guidance designed to help users get hired **without** turning the product into a social network.

**Database:** Logging outreach requires the `networking_actions` table. Run migration **00012_networking_support.sql** in your Supabase project (Dashboard → SQL Editor, or `supabase db push`). If the table is missing, the app shows a friendly error when you try to log an action.

## Philosophy (calm, non-spammy)

- **Attempts over outcomes**: we track what you *did* (sent 1 outreach), not replies, acceptance rates, or “wins”.
- **Small and measurable**: a weekly goal like **1** is valid. The default is intentionally low.
- **Phase-aware**: early phases focus on advice-first connections; job-ready phases focus on targeted, role-aligned outreach.
- **No automation**: no mass connection tactics, scraping, templated spam, or “send 100 messages”.
- **Copy-ready, personalize brackets**: drafts are full message text with `[brackets]` the user must fill. Copy pastes the message body only—not instructions.

## What we track (and what we don’t)

### We track

`networking_actions` rows:
- action_date (date)
- action_type:
  - outreach_sent
  - follow_up_sent
  - comment_left
  - post_published
  - coffee_chat_requested
- optional short note (140 chars)
- optional context_phase_id (reserved for future)

### We don’t track

- Replies
- Acceptance rates
- Referral outcomes
- Social graphs or inbox messages

## Where it shows up in the UI

- **Dashboard**: “Networking this week” card with weekly focus, recommended action, **ready-to-send draft** (Copy message), and attempt checkboxes (Pro).
- **Weekly check-in**: compact networking goal + log (where present).
- **Roadmap step modal**: Networking focus + message draft cards (instruction + full body + bracket checklist).

## Draft design (tone + friction)

- Short instruction (who / when) above the body.
- Body is human and professional: no “hope this finds you well”, “pick your brain”, “thrilled to connect”, or mentor-begging.
- Role + current focus are pre-filled; only personal details stay in `[brackets]`.
- One primary draft on the dashboard matched to the recommended action.
- Free users get 1 draft per phase in the roadmap modal; Pro gets the full set for that phase.

## Example (early phase advice DM)

**Instruction:** Send to someone 1–2 years ahead. Keep under ~80 words. One question only.

**Body (copy):**
```
Hi [Name] — came across your work on [specific post or project]. I'm working toward Frontend Engineer and currently focused on Advanced React patterns.

If you have a minute: what would you prioritize in the next month that most people skip?

No worries if you're busy — either way, appreciate your time.
```

## Code

- Guidance: `lib/server/networking/guidance.ts`
- Draft types: `lib/networking/draftTypes.ts`
- UI: `components/networking/MessageDraftCard.tsx`
