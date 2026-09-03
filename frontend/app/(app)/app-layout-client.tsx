"use client"

import { AppAuthGate } from "@/components/layout/app-auth-gate"
import { AppShell } from "@/components/layout/app-shell"
import { useKeyboardShortcuts } from "@/hooks/ui/useKeyboardShortcuts"

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()

  return (
    <AppShell>
      <AppAuthGate>{children}</AppAuthGate>
    </AppShell>
  )
}
