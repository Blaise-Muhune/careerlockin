import { appEyebrowClass, appPageTitleClass } from "@/lib/layout/app";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5 min-w-0">
        {eyebrow ? <p className={appEyebrowClass}>{eyebrow}</p> : null}
        <h1 className={appPageTitleClass}>{title}</h1>
        {subtitle != null && subtitle !== "" ? (
          <p className="text-base text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action != null ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
