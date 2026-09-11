"use client"

import { AppAuthGate } from "@/components/layout/app-auth-gate"
import { AppShell } from "@/components/layout/app-shell"

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AppAuthGate>{children}</AppAuthGate>
    </AppShell>
  )
}
