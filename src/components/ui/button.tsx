import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-[#38f2dd] to-[#86efac] text-slate-900 shadow-[0_14px_40px_rgba(34,211,238,0.35)] hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
        destructive:
          "bg-destructive/90 text-destructive-foreground shadow-[0_12px_30px_rgba(248,113,113,0.35)] hover:bg-destructive",
        outline:
          "border border-white/15 bg-white/5 text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:border-white/25 hover:bg-white/10",
        secondary:
          "bg-white/10 text-foreground border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:bg-white/15",
        ghost: "text-foreground hover:bg-white/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
