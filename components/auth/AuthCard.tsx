import { Card } from "@/components/ui/card";
import { appAuthCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export function AuthCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(appAuthCardClass, className)} {...props} />;
}
