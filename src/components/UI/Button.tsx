import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-50 focus:ring-slate-400 disabled:pointer-events-none focus:ring-offset-slate-900 data-[state=open]:bg-slate-800",
  {
    variants: {
      variant: {
        primary: "hover:bg-slate-700 bg-slate-50 text-slate-900",
        destructive: "bg-k-danger-base  text-k-white hover:bg-red-600 ",
        outline:
          "bg-transparent border hover:bg-slate-100 border-slate-700 text-slate-100",
        subtle: "hover:bg-slate-200 bg-slate-700 text-slate-100",
        ghost:
          "bg-transparent  hover:bg-slate-800 text-slate-100 hover:text-slate-100  data-[state=open]:bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline  text-slate-100  hover:bg-transparent",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const Component = props.asChild ? Slot : "button";
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
