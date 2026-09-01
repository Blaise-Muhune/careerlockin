import { appEyebrowClass } from "@/lib/layout/app";

type AppSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AppSection({ eyebrow, title, description, children }: AppSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        {eyebrow ? <p className={appEyebrowClass}>{eyebrow}</p> : null}
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
