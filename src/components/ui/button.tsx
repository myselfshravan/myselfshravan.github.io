import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { trackButtonClick } from '@/lib/analytics';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonTrackingProps {
  trackingCategory?: string;
  trackingId?: string;
  trackingAction?: string;
  trackingContext?: {
    section: string;
    position?: number;
    url?: string;
    metadata?: Record<string, unknown>;
  };
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  trackingCategory,
  trackingId,
  trackingAction,
  trackingContext,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonTrackingProps & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track button click if tracking props are provided
    if (trackingCategory && trackingId && trackingAction) {
      try {
        await trackButtonClick(trackingCategory, trackingId, trackingAction, trackingContext);
      } catch (error) {
        console.error('Button tracking error:', error);
      }
    }
    // Call original onClick handler
    onClick?.(event);
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  );
}

export { Button, buttonVariants };
