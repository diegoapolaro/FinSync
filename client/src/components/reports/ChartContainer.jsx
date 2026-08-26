import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export default function ChartContainer({ title, subtitle, icon, children, className = '' }) {
  return (
    <Card
      className={cn(
        'p-6 shadow-sm border border-border/80 hover:shadow-card-hover transition-all duration-200',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-full bg-transparent text-primary border border-border flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div>{children}</div>
    </Card>
  );
}
