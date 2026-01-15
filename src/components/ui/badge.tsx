import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-[#86efac] text-slate-900 shadow-[0_6px_18px_rgba(34,211,238,0.28)]",
        secondary: "border-white/12 bg-white/10 text-foreground hover:bg-white/15",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_8px_20px_rgba(248,113,113,0.28)]",
        outline: "border-white/20 text-foreground bg-white/5 hover:bg-white/10",
        urgent: "border-urgent/35 bg-urgent/20 text-urgent-foreground",
        scheduled: "border-success/35 bg-success/20 text-success-foreground",
        triage: "border-warning/35 bg-warning/20 text-warning-foreground",
        neutral: "border-white/12 bg-white/5 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
