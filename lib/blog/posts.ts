/**
 * Blog posts: single source of truth for content.
 * Content is plain text; paragraphs are separated by double newlines.
 */

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date, e.g. 2025-01-15
  content: string;
};

const posts: BlogPost[] = [
  {
    slug: "why-roadmaps-beat-to-do-lists",
    title: "Why roadmaps beat to‑do lists for learning",
    description:
      "To‑do lists feel busy; roadmaps show where you are and what’s next. Here’s how we think about structured learning.",
    date: "2025-01-20",
    content: `When you’re learning on your own, it’s easy to either over-plan (endless lists) or under-plan (random courses). A roadmap is different: it’s a path with phases, steps, and an order that matches your goal and time.

CareerLockin gives you one roadmap at a time, tied to a target role and how many hours per week you can realistically spend. Each step has a small set of resources and an estimate, so you always know what “done” looks like.

That doesn’t replace daily to‑dos—you can still track tasks inside steps—but it keeps your priorities clear. You’re not choosing from a giant list; you’re moving through a plan that’s sized to you.`,
  },
  {
    slug: "how-we-estimate-hours",
    title: "How we estimate hours per step",
    description:
      "Step estimates are there to set expectations, not to stress you out. We explain how they’re chosen and how to use them.",
    date: "2025-01-18",
    content: `Every step in your roadmap comes with an estimated number of hours. Those numbers aren’t pulled from thin air: they’re based on typical time to finish that kind of work (reading, exercises, small projects) for someone who’s new to the topic.

We’re not trying to be precise to the minute. The goal is to give you a sense of scope so you can plan your week and see how today fits into the bigger picture.

If you finish faster or need more time, that’s normal. Use the estimate as a guide, and adjust your pace based on how you learn. Progress is what matters, not hitting a number.`,
  },
  {
    slug: "tech-career-with-limited-time",
    title: "Building a tech career with limited time",
    description:
      "You don’t need 40 hours a week to move forward. A few focused hours, a clear target, and a plan that fits your life can be enough.",
    date: "2025-01-15",
    content: `A lot of advice assumes you can treat learning like a full-time job. For many people, that’s not realistic. You might have a day job, family, or other commitments. The good news: you don’t need endless hours to make progress.

What matters more is consistency and direction. Pick a target role you care about, decide how many hours per week you can actually invest, and get a roadmap that’s built for that amount of time. CareerLockin does exactly that—you tell us your goal and your weekly hours, and we give you a phased plan that fits.

Small, steady steps beat sporadic cramming. A roadmap keeps you on track so those hours add up instead of feeling scattered.`,
  },
];

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (b.date < a.date ? -1 : 1));
}

/** One post by slug, or null. */
export function getPostBySlug(slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Slugs for static generation. */
export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
