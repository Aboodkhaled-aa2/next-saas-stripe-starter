interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {heading}
        </h1>

        {text && (
          <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {text}
          </p>
        )}
      </div>

      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
