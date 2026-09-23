import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy/8 pb-6 dark:border-white/10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
