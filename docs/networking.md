# Networking Support

CareerLockin includes lightweight networking guidance designed to help users get hired **without** turning the product into a social network.

**Database:** Logging outreach requires the `networking_actions` table. Run migration **00012_networking_support.sql** in your Supabase project (Dashboard → SQL Editor, or `supabase db push`). If the table is missing, the app shows a friendly error when you try to log an action.

## Philosophy (calm, non-spammy)

- **Attempts over outcomes**: we track what you *did* (sent 1 outreach), not replies, acceptance rates, or “wins”.
- **Small and measurable**: a weekly goal like **1** is valid. The default is intentionally low.
- **Phase-aware**: early phases focus on advice-first connections; job-ready phases focus on targeted, role-aligned outreach.
- **No automation**: no mass connection tactics, scraping, templated spam, or “send 100 messages”.
- **Personalization required**: message outlines are *formats*, not final DMs.

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

- **Dashboard**: “Networking this week” card with weekly focus + a single recommended action + “Log outreach”.
- **Weekly check-in**: a compact “Networking” section to adjust your weekly goal and quickly log an action.
- **Roadmap step modal**: a small “Networking focus” row + an expandable “Message outline” section with a copy-outline button.

## Example guidance output (phase-aware)

### Beginner phase (Phase 1)

- weekly_focus_title: “Advice-first networking”
- weekly_focus_description: “Build relationships by asking for perspective, not opportunities.”
- suggested action example: “Send 1 advice request to someone 1–2 years ahead”

### Mid phase (Phase 2)

- weekly_focus_title: “Warm visibility + focused questions”
- weekly_focus_description: “Share progress or ask a specific question that improves your roadmap.”
- suggested action example: “Ask 1 engineer about stacks + expectations at their company”

### Job-ready phase (Phase 3+)

- weekly_focus_title: “Targeted outreach (quality over volume)”
- weekly_focus_description: “Send one specific message tied to a real role and a real proof point.”
- suggested action example: “Send 1 targeted note about a role + your relevant project”

## Example message outlines (formats, not scripts)

### Advice request

- Subject: “Quick question about getting into \<target role\>”
- Outline:
  - Why you’re reaching out (specific reason you picked them)
  - What you’re working on right now (1 line)
  - One focused question (priority for next 4–6 weeks)
  - Easy out + thanks
- Note: “Add a real detail (their post/project/company) before sending.”

### Coffee chat request

- Subject: “Would you be open to a 15-minute chat?”
- Outline:
  - Why them + why now
  - Your goal (role + timeline)
  - Ask for 15 minutes + propose 2 time windows
  - Thanks + easy out
- Note: “Keep the ask small; don’t ask them to ‘mentor’ you.”

### Referral question (job-ready only)

- Subject: “Referral question for a \<target role\> role (short)”
- Outline:
  - Which role you’re applying to (job title + link)
  - Two role-aligned proof points (projects/results)
  - Why you fit this specific team/company (1 sentence)
  - Ask if they’d be comfortable referring you (easy out)
- Note: “Include a real job link + 2 real proof points, in your own words.”

