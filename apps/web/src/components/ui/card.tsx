import * as React from 'react';
import { cn } from '@/lib/utils';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/** White surface with a hairline border and a soft shadow. */
const Card = React.forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border border-line bg-white shadow-soft', className)}
    {...props}
  />
));
Card.displayName = 'Card';

interface CardHeaderProps extends Omit<DivProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned controls. */
  action?: React.ReactNode;
}

/** Title row of a card, separated from the body by a hairline. */
function CardHeader({ title, description, action, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

const CardContent = React.forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-line bg-paper/60 px-5 py-3',
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardFooter, CardHeader };
