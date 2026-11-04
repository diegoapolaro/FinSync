import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  id?: string;
  title: string;
  description?: string;
  superLabel?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  icon?: React.ElementType | string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsSection({
  id,
  title,
  description,
  superLabel,
  badge,
  headerAction,
  icon: Icon,
  children,
  className = '',
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 bg-card rounded-2xl p-6 md:p-7 shadow-sm border border-border/80 flex flex-col gap-6 transition-all',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex flex-col gap-1">
          {superLabel && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
              {superLabel}
            </span>
          )}
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="text-primary shrink-0">
                {typeof Icon === 'string' ? (
                  <span className="material-symbols-outlined text-xl">{Icon}</span>
                ) : (
                  <Icon className="w-5 h-5 text-primary" />
                )}
              </span>
            )}
            <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight font-sans">
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {badge}
          {headerAction}
        </div>
      </div>
      {children}
    </section>
  );
}
