import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Default narrow column for login-style pages. */
  width?: "narrow" | "wide";
};

export function AuthPageShell({
  children,
  className,
  width = "narrow",
}: AuthPageShellProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        width === "narrow" && "max-w-md self-center",
        width === "wide" && "max-w-5xl lg:max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}
