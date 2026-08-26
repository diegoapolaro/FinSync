import { cn } from '@/lib/utils';

export default function SettingsSection({ id, title, icon: Icon, children, className = '' }) {
  return (
    <section id={id} className={cn('scroll-mt-28 space-y-4', className)}>
      <div className="flex items-center gap-2 pb-3 border-b">
        {Icon && (
          <span className="text-foreground">
            {typeof Icon === 'string' ? (
              <span className="material-symbols-outlined text-xl">{Icon}</span>
            ) : (
              <Icon className="w-5 h-5" />
            )}
          </span>
        )}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}
