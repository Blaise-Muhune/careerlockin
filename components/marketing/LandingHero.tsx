"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  marketingContainerClass,
  marketingHeroSectionClass,
} from "@/lib/layout/marketing";
import { LandingHeroForm } from "./LandingHeroForm";
import { RoadmapPreviewMock } from "./RoadmapPreviewMock";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function LandingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={`${marketingContainerClass} ${marketingHeroSectionClass}`}
      aria-labelledby="hero-heading"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-10 lg:gap-14 xl:gap-16 items-start lg:items-center w-full min-w-0">
        <motion.div
          className="text-left min-w-0 order-1 max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: easeOut }}
        >
          <h1
            id="hero-heading"
            className="text-[1.875rem] sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.5rem] font-bold text-foreground tracking-[-0.03em] leading-[1.06]"
          >
            Stop guessing what to learn for your tech career.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 sm:mt-6 leading-relaxed max-w-xl">
            Tell CareerLockin the job you want, what you already know, and how much
            time you have each week. Get a step-by-step plan showing exactly what to
            learn, build, and work on next.
          </p>
          <LandingHeroForm />
          <p className="text-sm text-muted-foreground mt-5">
            <Link
              href="#how-it-works"
              className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              See how it works
            </Link>
          </p>
        </motion.div>

        <motion.div
          id="see-what-you-get"
          className="w-full min-w-0 order-2 lg:justify-self-end"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            delay: reduceMotion ? 0 : 0.05,
            ease: easeOut,
          }}
        >
          <RoadmapPreviewMock compact />
        </motion.div>
      </div>
    </section>
  );
}
