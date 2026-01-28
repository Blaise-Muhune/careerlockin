# UI design principles and conventions

This doc describes the design principles, tone of voice, and UI customizations used in CareerLockin so the app feels trustworthy, focused, and product-ready—without generic “AI app” aesthetics.

---

## Design principles

1. **Clarity and hierarchy**
   - Each page has a clear structure: **page title** (outcome-focused), **short subtitle** (context, not marketing), **one primary action** where it makes sense.
   - Section headers are distinct; body text is readable and calm.
   - Whitespace is used deliberately to separate sections and reduce noise.

2. **Calm confidence**
   - Trustworthy and focused, not hypey or salesy.
   - No gradients or decorative animations.
   - No marketing copy inside the app.

3. **Consistency**
   - Buttons: primary (default) for the main action, secondary/outline for alternatives, destructive only when needed.
   - Cards: same padding (`px-6`), radius (`rounded-xl`), and light shadow; borders only where they aid scannability.
   - Forms: consistent labels, spacing (`gap-4` in content, `gap-2` per field), and error text placement.

4. **Feedback**
   - Loading: short labels (“Creating…”, “Saving…”) rather than heavy spinners.
   - Empty states: short, direct (“Nothing logged yet. Add one above.”).
   - Errors: calm and helpful, not technical. Prefer “Something went wrong. Please try again.” over raw server messages when the user can’t act on the detail.

---

## Tone of voice

- **Direct**: Say what the user does or what happens. “Create my roadmap” not “Generate Roadmap”. “Save” not “Submit” or “Save Check-in”.
- **Human**: Short sentences. No “leverage”, “optimize your journey”, or “AI-generated”.
- **Confident**: Avoid over-explaining. “Your current progress and next steps.” not “You are signed in. Your roadmaps and progress will appear here.”

Examples applied in the app:

| Before                    | After                        |
|---------------------------|------------------------------|
| Generate Roadmap          | Create my roadmap            |
| Save Check-in             | Save                         |
| You are signed in. Your roadmaps and progress will appear here. | Your current progress and next steps. |
| You do not have a roadmap yet. Generate one from the dashboard. | You don’t have a roadmap yet. Create one from the dashboard. |
| Back to Dashboard         | Go to dashboard              |
| Tell us about your goals so we can build your roadmap. | A few details so we can build your plan. |
| Complete your profile     | Set up your profile          |
| Sign in with your email and password. | Sign in to your account.    |
| Create an account with your email and password. | Create an account.           |

---

## Components and layout customized

- **App shell** (`components/app-shell.tsx`): Top nav with app name “CareerLockin” (links to dashboard), links to Dashboard and Roadmap, and Log out. Sticky header, max-width content (`max-w-4xl`), consistent padding. Used by all `(app)` routes.
- **Cards** (shadcn `components/ui/card.tsx`): Base unchanged. Used with `CardHeader` (title + description), `CardContent`, `CardFooter`. Padding and radius are consistent via the card component.
- **Buttons** (shadcn `components/ui/button.tsx`): Base unchanged. Primary for main actions (e.g. “Create my roadmap”, “View roadmap”), `variant="secondary"` or `variant="ghost"` for nav and secondary actions.
- **Roadmap phases**: Phases are rendered as `<section>` with an `h2` (“Phase N: Title”) and a list of steps—no card per phase, to keep the roadmap feeling like a plan, not a dashboard of cards.
- **Step rows** (`app/(app)/roadmap/step-row.tsx`): Light background; completed steps use `bg-muted/50`, incomplete use `bg-muted/30`. No heavy borders.
- **Recent check-ins** list: Items use `rounded-lg bg-muted/40` and padding only—no borders—to reduce visual noise.
- **Page structure**: Dashboard, Roadmap, and empty Roadmap use the same pattern: `space-y-1` for title + subtitle, then primary action, then sections with `gap-6` or `gap-8`.

---

## What we avoid

- Animations added for their own sake.
- Gradients used broadly.
- Marketing or “AI” language inside the app.
- New dependencies for UI only.
- Dense walls of text or long, explanatory blocks.
