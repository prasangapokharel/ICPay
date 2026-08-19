import { TextInput, type TextInputProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-4xl text-foreground placeholder:text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'border border-input bg-input/30 px-3',
        search: 'h-10 rounded-full border border-input bg-input/30 pr-4 pl-10',
        ghost: 'border-0 bg-transparent px-3',
      },
      size: {
        default: 'h-9 text-base',
        lg: 'h-12 px-4 text-base',
        xl: 'h-14 px-4 text-lg',
        amount: 'h-14 px-4 text-2xl font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type InputProps = TextInputProps &
  VariantProps<typeof inputVariants> & {
    className?: string
  }

export function Input({ className, variant, size, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor="rgb(140,140,140)"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}
