"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Check, X } from "lucide-react"
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
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!username.trim() || username === user.username?.[0]) { setCheckResult(null); return }
    setChecking(true)
    const available = await onCheckUsername(username.trim())
    setCheckResult(available)
    setChecking(false)
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
          <User className="h-5 w-5" />
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
              {checkResult === true && <Check className="h-5 w-5 text-green-500" />}
              {checkResult === false && <X className="h-5 w-5 text-red-500" />}
            </div>
            {checkResult === true && <p className="text-xs text-green-500">Username is available</p>}
            {checkResult === false && <p className="text-xs text-red-500">Username is taken</p>}
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
