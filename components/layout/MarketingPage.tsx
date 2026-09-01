import { LandingShell } from "./LandingShell";

import { MarketingFooter } from "./MarketingFooter";

import {

  marketingContainerClass,

  marketingContainerContentClass,

  marketingContainerNarrowClass,

  marketingEyebrowClass,

  marketingSectionLeadClass,

  marketingSectionTitleClass,

} from "@/lib/layout/marketing";

import { cn } from "@/lib/utils";



type MarketingPageProps = {

  children: React.ReactNode;

  eyebrow?: string;

  title?: string;

  description?: string;

  width?: "default" | "narrow" | "content";

  className?: string;

  showFooter?: boolean;

};



const widthClass = {

  default: marketingContainerClass,

  narrow: marketingContainerNarrowClass,

  content: marketingContainerContentClass,

} as const;



export function MarketingPage({

  children,

  eyebrow,

  title,

  description,

  width = "default",

  className,

  showFooter = true,

}: MarketingPageProps) {

  return (

    <LandingShell>

      <div className={cn(widthClass[width], "py-10 sm:py-16 lg:py-20 min-w-0", className)}>

        {(eyebrow || title || description) && (

          <header className="mb-10 sm:mb-12">

            {eyebrow ? <p className={marketingEyebrowClass}>{eyebrow}</p> : null}

            {title ? (

              <h1 className={cn(marketingSectionTitleClass, "mt-3 text-left")}>{title}</h1>

            ) : null}

            {description ? (

              <p className={cn(marketingSectionLeadClass, "mt-4 text-left mx-0")}>{description}</p>

            ) : null}

          </header>

        )}

        {children}

      </div>

      {showFooter && <MarketingFooter />}

    </LandingShell>

  );

}

