import { Children, type ReactNode } from 'react'
import { Pressable, type PressableProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-2xl border border-transparent active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        outline: 'border-border/50 bg-input/30',
        secondary: 'bg-secondary',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive/10',
        link: 'bg-transparent',
      },
      size: {
        default: 'h-9 px-3',
        xs: 'h-6 px-2.5',
        sm: 'h-8 px-3',
        lg: 'h-12 px-5',
        xl: 'h-14 px-6',
        icon: 'size-9',
        'icon-xs': 'size-6',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const labelVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive',
      link: 'text-primary',
    },
  },
  defaultVariants: { variant: 'default' },
})

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children?: ReactNode
    className?: string
    textClassName?: string
  }

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  disabled,
  textClassName,
  ...props
}: ButtonProps) {
  const content = Children.toArray(children).map((child, index) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return (
        <Text key={index} className={cn(labelVariants({ variant }), textClassName)}>
          {child}
        </Text>
      )
    }
    return child
  })

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), disabled && 'opacity-40', className)}
      {...props}
    >
      {content}
    </Pressable>
  )
}

export { buttonVariants }
