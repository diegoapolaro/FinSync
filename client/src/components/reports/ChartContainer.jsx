import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export default function ChartContainer({ title, icon, children, className = '' }) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {icon && (
          <span className="text-muted-foreground text-sm flex items-center justify-center">
            {typeof icon === 'string' ? (
              <span className="text-muted-foreground text-sm">{icon}</span>
            ) : (
              icon
            )}
          </span>
        )}
      </div>
      <div>{children}</div>
    </Card>
  );
}
