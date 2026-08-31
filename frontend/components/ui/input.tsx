import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/ui/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "",
        search: "pl-9",
        ghost: "border-transparent bg-transparent shadow-none focus-visible:ring-0",
      },
      size: {
        default: "h-9",
        lg: "h-11 text-base",
        xl: "h-12 text-lg font-medium",
        amount: "h-14 text-2xl font-semibold tracking-tight md:text-3xl",
        auto: "h-auto min-h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

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
