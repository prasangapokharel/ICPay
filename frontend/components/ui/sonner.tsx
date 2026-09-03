"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  InformationCircleIcon,
  Alert02Icon,
  Cancel01Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={2} />,
        info: <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={2} />,
        warning: <HugeiconsIcon icon={Alert02Icon} className="size-4" strokeWidth={2} />,
        error: <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />,
        loading: <HugeiconsIcon icon={Loading01Icon} className="size-4 animate-spin" strokeWidth={2} />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
