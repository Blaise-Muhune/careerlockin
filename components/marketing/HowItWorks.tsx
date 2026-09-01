import {
  marketingContainerClass,
  marketingEyebrowClass,
} from "@/lib/layout/marketing";
import { LandingReveal } from "./LandingReveal";
import {
  StepOneIllustration,
  StepThreeIllustration,
  StepTwoIllustration,
} from "./LandingHowIllustrations";

const steps = [
  {
    title: "Tell us what you are aiming for.",
    description:
      "Add your target role and how many hours per week you can invest. CareerLockin scopes the plan to your schedule, not a generic curriculum.",
    Illustration: StepOneIllustration,
  },
  {
    title: "You get a clear plan.",
    description:
      "Phases, steps, curated resources, and time estimates—built from your profile in about a minute.",
    Illustration: StepTwoIllustration,
  },
  {
    title: "Follow it your way.",
    description:
      "Check off steps and log time when you want to, or use the plan on your own. Tracking stays optional.",
    Illustration: StepThreeIllustration,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`${marketingContainerClass} py-12 sm:py-20 lg:py-28 border-t border-border/50`}
      aria-labelledby="how-heading"
    >
      <LandingReveal className="mb-10 sm:mb-16 lg:mb-20">
        <p className={marketingEyebrowClass}>How it works</p>
        <h2
          id="how-heading"
          className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mt-4 max-w-2xl leading-[1.08]"
        >
          From &ldquo;what should I do next?&rdquo; to a plan you can follow.
        </h2>
      </LandingReveal>

      <div className="space-y-12 sm:space-y-20 lg:space-y-24">
        {steps.map((step, index) => (
          <LandingReveal key={step.title} delay={index * 0.05}>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-10 lg:gap-16 items-center">
              <div className="flex gap-6 sm:gap-8">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < steps.length - 1 ? (
                    <div
                      className="relative mt-3 w-px flex-1 min-h-[120px] bg-border/70"
                      aria-hidden
                    >
                      {index === 0 ? (
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/50 to-transparent" />
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>
              <div className="lg:justify-self-end w-full">
                <step.Illustration />
              </div>
            </div>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
