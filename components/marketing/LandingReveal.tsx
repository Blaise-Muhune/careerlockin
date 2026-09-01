"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type LandingRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/** Scroll-triggered fade-up. Honors prefers-reduced-motion (taste-skill Section 6.B). */
export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
