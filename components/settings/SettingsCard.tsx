import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SettingsCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  danger?: boolean;
};

export function SettingsCard({
  children,
  className,
  title,
  description,
  danger = false,
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60",
        danger && "border-destructive/30 bg-destructive/[0.02]",
        className
      )}
    >
      {title ? (
        <CardHeader className="pb-3">
          <CardTitle
            className={cn(
              "text-lg font-bold tracking-tight",
              danger && "text-destructive"
            )}
          >
            {title}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      {title ? <CardContent className="pt-0">{children}</CardContent> : children}
    </Card>
  );
}
