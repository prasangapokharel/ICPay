"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import type { UserPublic } from "@/services/types"
import { formatPrincipal } from "@/lib/wallet-utils"

type ProfileCardProps = {
  user: UserPublic
  principal: string
  onUpdateUsername: (username: string) => Promise<string | null>
  onCheckUsername: (name: string) => Promise<boolean>
}

export function ProfileCard({ user, principal, onUpdateUsername, onCheckUsername }: ProfileCardProps) {
  const [username, setUsername] = useState(user.username?.[0] ?? "")
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!username.trim() || username === user.username?.[0]) { setCheckResult(null); return }
    const available = await onCheckUsername(username.trim())
    setCheckResult(available)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username.trim()) { setError("Username is required"); return }
    setLoading(true)
    const err = await onUpdateUsername(username.trim())
    if (err) setError(err)
    else setCheckResult(null)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
          Profile
        </CardTitle>
        <CardDescription>Manage your wallet profile and username</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Principal</Label>
          <p className="font-mono text-sm">{formatPrincipal(principal)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">User ID</Label>
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
        </div>
        <Separator />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                placeholder="@username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setCheckResult(null) }}
                onBlur={handleCheck}
              />
              {checkResult === true && <HugeiconsIcon icon={Tick02Icon} className="h-5 w-5 text-success" />}
              {checkResult === false && <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-destructive" />}
            </div>
            {checkResult === true && <p className="text-xs text-success">Username is available</p>}
            {checkResult === false && <p className="text-xs text-destructive">Username is taken</p>}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
