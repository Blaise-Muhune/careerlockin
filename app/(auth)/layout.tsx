import type { Metadata } from "next";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen min-h-[100dvh] marketing-dot-grid flex flex-col min-w-0 overflow-x-clip">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <AuthBrandHeader />
        <div className="mt-8 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
