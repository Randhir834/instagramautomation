import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[transform,box-shadow,background-color] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:border-ink/30 disabled:bg-[#e9e5dc] disabled:text-ink/70 disabled:shadow-none',
  {
    variants: {
      variant: {
        default:
          'border-2 border-ink bg-brand text-white shadow-[0_3px_0_0_#1a1714] hover:-translate-y-px hover:shadow-[0_4px_0_0_#1a1714] active:translate-y-[3px] active:shadow-none',
        secondary:
          'border-2 border-ink bg-butter text-ink shadow-[0_3px_0_0_#1a1714] hover:-translate-y-px hover:shadow-[0_4px_0_0_#1a1714] active:translate-y-[3px] active:shadow-none',
        outline:
          'border-2 border-ink bg-white text-ink shadow-[0_3px_0_0_#1a1714] hover:-translate-y-px hover:bg-butter-tint hover:shadow-[0_4px_0_0_#1a1714] active:translate-y-[3px] active:shadow-none',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
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
