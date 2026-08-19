// frontend/components/feature/feature-form.tsx
// Domain UI — calls service on submit, uses hooks for reads.

"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createFeature } from "@/services/feature/feature"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FeatureForm({ onCreated }: { onCreated?: () => void }) {
  const { identity } = useAuth()
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    const result = await createFeature(identity, name)
    setBusy(false)
    if (result.ok) onCreated?.()
  }

  return (
    <div className="space-y-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <Button disabled={busy || !name} onClick={submit}>
        Create
      </Button>
    </div>
  )
}
