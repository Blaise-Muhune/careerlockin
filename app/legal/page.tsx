import Link from "next/link";
import type { Metadata } from "next";
import { MarketingPage } from "@/components/layout/MarketingPage";
import {
  marketingEyebrowClass,
  marketingFeatureCardClass,
} from "@/lib/layout/marketing";
import { siteUrl, supportEmail } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const LEGAL_LAST_UPDATED = "September 1, 2026";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "Privacy Policy, Terms of Service, refund policy, and subscription cancellation for CareerLockin.",
  alternates: { canonical: `${siteUrl}/legal` },
};

type LegalSectionProps = {
  title: string;
  summary: string;
  children: React.ReactNode;
};

function LegalSection({ title, summary, children }: LegalSectionProps) {
  return (
    <section className={cn(marketingFeatureCardClass, "space-y-4")}>
      <div>
        <p className={marketingEyebrowClass}>{title}</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{summary}</p>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <MarketingPage
      width="narrow"
      eyebrow="Legal"
      title="Privacy & Terms"
      description={`Last updated: ${LEGAL_LAST_UPDATED}`}
    >
      <div className="space-y-4">
        <LegalSection title="Privacy Policy" summary="How we collect and use your information">
          <p>
            We collect only what we need to run the product: email and password for your
            account, and the information you provide during onboarding (e.g. target role,
            weekly hours, goals). We use it to build your roadmap, track progress if you
            use Pro, and send optional emails (e.g. weekly recap, milestones) when you
            enable them in Settings.
          </p>
          <p>
            We do not sell your data. We use Supabase for auth and data storage, Stripe for
            payments, and Resend for optional emails. Their respective privacy policies
            apply to data processed by those services.
          </p>
          <p>
            You can delete your account and data from your account settings. For questions
            about privacy, contact us at the email listed below.
          </p>
        </LegalSection>

        <LegalSection title="Terms of Service" summary="Rules for using CareerLockin">
          <p>
            By creating an account and using CareerLockin, you agree to use the service
            responsibly and in line with these terms. You must provide accurate information
            and keep your login details secure. You may not misuse the service, attempt to
            gain unauthorized access, or use it for anything illegal.
          </p>
          <p>
            The roadmaps and content we provide are for your personal use. We do not
            guarantee career or learning outcomes. You are responsible for your own
            decisions and use of the content.
          </p>
          <p>
            We may update these terms from time to time. Continued use after changes means
            you accept the updated terms. Significant changes will be communicated where
            appropriate.
          </p>
        </LegalSection>

        <LegalSection title="Refunds" summary="All plans are final sale">
          <p>
            <strong className="text-foreground">There are no refunds for any plan.</strong>{" "}
            One-time purchases (e.g. full roadmap unlock) and Pro subscriptions are
            non-refundable. Before you pay, make sure you&apos;re okay with this.
          </p>
        </LegalSection>

        <LegalSection
          title="Pro subscription & cancellation"
          summary="You can cancel Pro anytime"
        >
          <p>
            Pro is a recurring subscription. You can cancel it at any time with no questions
            asked. To cancel: go to Settings, Unlock options, then{" "}
            <strong className="text-foreground">Manage billing</strong>. That opens the
            Stripe billing portal where you can cancel your subscription, update payment
            methods, or view invoices.
          </p>
          <p>
            After you cancel, you keep Pro access until the end of the current billing
            period. When the period ends, subscription features (e.g. tracking, time logs,
            insights, email preferences) stop, but you keep access to any one-time unlock
            you&apos;ve already purchased (e.g. full roadmap).
          </p>
        </LegalSection>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Questions?{" "}
        <a
          href={`mailto:${supportEmail}`}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {supportEmail}
        </a>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
        {" · "}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </MarketingPage>
  );
}
