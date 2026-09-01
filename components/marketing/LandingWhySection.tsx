import {
  Compass,
  Layers3,
  Link2,
  ListTodo,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  marketingContainerClass,
  marketingEyebrowClass,
  marketingFeatureCardClass,
  marketingSplitTitleClass,
} from "@/lib/layout/marketing";
import { LandingReveal } from "./LandingReveal";

type Feature = {
  category: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    category: "Clarity",
    title: "Stop guessing what to learn next.",
    description:
      "One ordered plan from your target role, so you always know the next step instead of opening another bookmark folder.",
    icon: Compass,
  },
  {
    category: "Structure",
    title: "Phases sized to your weekly hours.",
    description:
      "Every phase and step includes time estimates that respect how much you can actually invest each week.",
    icon: Layers3,
  },
  {
    category: "Resources",
    title: "Grounded links on every step.",
    description:
      "Each step comes with one or two curated resources, not an endless list of tabs to sort through yourself.",
    icon: Link2,
  },
  {
    category: "Freedom",
    title: "Track progress only if you want.",
    description:
      "Use the roadmap as a checklist, log time when it helps, or follow the plan offline. You stay in control.",
    icon: ListTodo,
  },
  {
    category: "Speed",
    title: "Your roadmap in about a minute.",
    description:
      "Share your role and hours once. CareerLockin turns that into phases, steps, and estimates right away.",
    icon: Timer,
  },
  {
    category: "Focus",
    title: "One plan, not another course pile.",
    description:
      "Built for students, switchers, self-taught devs, and busy professionals who want clarity over more options.",
    icon: TrendingUp,
  },
];

export function LandingWhySection() {
  return (
    <section
      id="why-careerlockin"
      className={`${marketingContainerClass} py-12 sm:py-20 lg:py-28 border-t border-border/50`}
      aria-labelledby="why-heading"
    >
      <LandingReveal className="mb-12 sm:mb-16">
        <p className={marketingEyebrowClass}>• Why people use CareerLockin</p>
        <h2 id="why-heading" className={`${marketingSplitTitleClass} mt-4`}>
          Tutorials are everywhere.{" "}
          <span className="text-muted-foreground">A clear path is not.</span>
        </h2>
      </LandingReveal>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
        {features.map((feature, index) => (
          <LandingReveal key={feature.title} delay={index * 0.04}>
            <article className={`${marketingFeatureCardClass} h-full`}>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-4" aria-hidden />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  {feature.category}
                </p>
              </div>
              <h3 className="text-lg font-bold text-foreground mt-5 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {feature.description}
              </p>
              <feature.icon
                className="pointer-events-none absolute bottom-4 right-4 size-16 text-foreground/[0.04]"
                aria-hidden
              />
            </article>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
