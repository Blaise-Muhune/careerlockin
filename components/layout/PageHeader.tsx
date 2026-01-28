type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle != null && subtitle !== "" && (
          <p className="text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action != null && <div className="mt-2 sm:mt-0 shrink-0">{action}</div>}
    </div>
  );
}
