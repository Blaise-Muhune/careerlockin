import { cn } from "@/lib/utils";

type AuthMessageProps = {
  children: React.ReactNode;
  variant?: "error" | "success";
  className?: string;
};

export function AuthMessage({
  children,
  variant = "error",
  className,
}: AuthMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium",
        variant === "error" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
        variant === "success" &&
          "border-success/30 bg-success/10 text-success",
        className
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
