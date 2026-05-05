import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-gold/40 bg-transparent text-foreground hover:border-gold hover:bg-gold/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary/50 hover:text-foreground",
        link: "text-gold underline-offset-4 hover:underline",
        gold: "bg-gradient-gold text-gold-foreground shadow-gold hover:shadow-[0_25px_60px_-15px_hsl(var(--gold)/0.6)] hover:-translate-y-0.5 font-semibold tracking-wide",
        outlineGold: "border border-gold text-gold hover:bg-gold hover:text-gold-foreground",
        navy: "bg-secondary text-foreground border border-border hover:border-gold/50",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-sm",
        sm: "h-9 px-4 rounded-sm text-xs",
        lg: "h-14 px-10 rounded-sm text-[13px] uppercase tracking-[0.18em]",
        xl: "h-16 px-12 rounded-sm text-sm uppercase tracking-[0.2em]",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
