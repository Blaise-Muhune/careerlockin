import { Card, CardContent } from "@/components/ui/card";

type EncouragementCardProps = {
  message: string;
};

export function EncouragementCard({ message }: EncouragementCardProps) {
  return (
    <Card className="border-l-4 border-l-primary/40 border-y border-r border-muted/60 bg-primary/[0.04] shadow-sm">
      <CardContent className="py-4 pr-5 pl-5">
        <p className="text-sm text-foreground/90 leading-relaxed">{message}</p>
      </CardContent>
    </Card>
  );
}
