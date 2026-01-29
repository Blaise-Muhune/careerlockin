import { LandingHeader } from "./LandingHeader";

type LandingShellProps = {
  children: React.ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
