import { LandingHeader } from "./LandingHeader";

type LandingShellProps = {
  children: React.ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="min-h-screen flex flex-col marketing-dot-grid min-w-0 overflow-x-clip">
      <LandingHeader />
      <main className="flex-1 min-w-0 overflow-x-clip">{children}</main>
    </div>
  );
}
