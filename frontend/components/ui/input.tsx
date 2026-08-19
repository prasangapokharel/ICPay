import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/ui/utils"

// Same shape as buttonVariants, for the same reason: the field styles were
// pasted per call site and had drifted into four different heights.
const inputVariants = cva(
  "w-full min-w-0 rounded-4xl py-1 transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "border border-input bg-input/30",
        search: "rounded-full border border-input bg-input/30",
        // For a field inside a card that already draws its own border.
        ghost: "border-0 bg-transparent shadow-none focus-visible:ring-0",
      },
      size: {
        default: "h-9 px-3 text-base md:text-sm",
        lg: "h-12 px-4 text-base",
        xl: "h-14 px-4 text-lg",
        // Amounts are the one field read at a glance rather than proofread.
        amount: "h-14 px-4 text-2xl font-semibold tabular-nums",
        auto: "h-auto px-3 text-base md:text-sm",
      },
    },
    // The leading room for the search icon has to beat the size variant's px,
    // and only a compound rule is ordered after it.
    compoundVariants: [
      { variant: "search", size: "default", class: "pl-9" },
      { variant: "search", size: "lg", class: "pl-10" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// The native size attribute is a character count, so it is dropped rather than
// shadowed -- no call site uses it, and leaving both would silently pick one.
type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>

function Input({ className, type, variant, size, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
