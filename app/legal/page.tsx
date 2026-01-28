import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteUrl, supportEmail } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "Privacy Policy, Terms of Service, refund policy, and subscription cancellation for CareerLockin.",
  alternates: { canonical: `${siteUrl}/legal` },
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Privacy & Terms
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy Policy</CardTitle>
              <CardDescription>How we collect and use your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                We collect only what we need to run the product: email and
                password for your account, and the information you provide during
                onboarding (e.g. target role, weekly hours, goals). We use it to
                build your roadmap, track progress if you use Pro, and send
                optional emails (e.g. weekly recap, milestones) when you enable
                them in Settings.
              </p>
              <p>
                We do not sell your data. We use Supabase for auth and data
                storage, Stripe for payments, and Resend for optional emails.
                Their respective privacy policies apply to data processed by
                those services.
              </p>
              <p>
                You can delete your account and data from your account settings.
                For questions about privacy, contact us at the email listed in
                your account or on our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terms of Service</CardTitle>
              <CardDescription>Rules for using CareerLockin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                By creating an account and using CareerLockin, you agree to use the
                service responsibly and in line with these terms. You must provide
                accurate information and keep your login details secure. You may
                not misuse the service, attempt to gain unauthorized access, or
                use it for anything illegal.
              </p>
              <p>
                The roadmaps and content we generate are for your personal
                use. We do not guarantee career or learning outcomes. You are
                responsible for your own decisions and use of the content.
              </p>
              <p>
                We may update these terms from time to time. Continued use after
                changes means you accept the updated terms. Significant changes
                will be communicated where appropriate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Refunds</CardTitle>
              <CardDescription>All plans are final sale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>There are no refunds for any plan.</strong> One-time
                purchases (e.g. full roadmap unlock) and Pro subscriptions are
                non-refundable. Before you pay, make sure you’re okay with this.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pro subscription & cancellation</CardTitle>
              <CardDescription>You can cancel Pro anytime</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Pro is a recurring subscription. You can cancel it at any time
                with no questions asked. To cancel: go to Settings → Unlock
                options → <strong>Manage billing</strong>. That opens the
                Stripe billing portal where you can cancel your subscription,
                update payment methods, or view invoices.
              </p>
              <p>
                After you cancel, you keep Pro access until the end of the
                current billing period. When the period ends, subscription
                features (e.g. tracking, time logs, insights, email preferences)
                stop, but you keep access to any one-time unlock you’ve already
                purchased (e.g. full roadmap).
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Questions?{" "}
          <a href={`mailto:${supportEmail}`} className="text-primary hover:underline underline-offset-2">
            {supportEmail}
          </a>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/signup" className="underline-offset-4 hover:underline">
            Sign up
          </Link>
          {" · "}
          <Link href="/login" className="underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
