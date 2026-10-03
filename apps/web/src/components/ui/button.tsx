import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-[10px] text-center font-semibold leading-tight',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0',
    'disabled:pointer-events-none disabled:border-transparent disabled:bg-paper-deep disabled:text-ink-soft disabled:shadow-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-ink text-white shadow-xs hover:bg-[#33302c]',
        brand: 'bg-brand text-white shadow-xs hover:bg-brand-dark',
        outline:
          'border border-line-strong bg-white text-ink shadow-xs hover:border-[#bfb6a6] hover:bg-paper',
        secondary: 'bg-paper-deep text-ink hover:bg-[#e6dfd2]',
        ghost: 'text-ink-soft hover:bg-ink/[0.05] hover:text-ink',
        danger: 'border border-line-strong bg-white text-brand-dark shadow-xs hover:bg-brand-tint',
        link: 'text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink',
      },
      size: {
        default: 'min-h-10 px-4 py-2 text-sm',
        sm: 'min-h-9 px-3 py-1.5 text-sm',
        lg: 'min-h-12 px-6 py-3 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
