import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#171717] text-white shadow-sm hover:bg-black",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        outline:
          "border border-[#EAECEF] bg-white text-[#171717] shadow-sm hover:bg-slate-50",
        secondary:
          "bg-slate-100 text-[#171717] hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100/70 text-[#737373] hover:text-[#171717]",
        link: "text-[#171717] underline-offset-4 hover:underline",
        subtle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
