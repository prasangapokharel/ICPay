"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Tick02Icon, Cancel01Icon, ShoppingBag01Icon, ArrowRight01Icon, Copy01Icon } from "@hugeicons/core-free-icons"
import type { UserPublic } from "@/services/types"
import { copyText, formatPrincipal } from "@/lib/wallet-utils"
import Link from "next/link"
import {
  validateFreeUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_FREE_MIN_LENGTH,
} from "@/lib/username"

type ProfileCardProps = {
  user: UserPublic
  principal: string
  onUpdateUsername: (username: string) => Promise<string | null>
  onCheckUsername: (name: string) => Promise<boolean>
}

export function ProfileCard({ user, principal, onUpdateUsername, onCheckUsername }: ProfileCardProps) {
  const claimed = user.username?.[0]
  const [username, setUsername] = useState("")
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedPrincipal, setCopiedPrincipal] = useState(false)

  // Copies the full principal, not the truncated form on screen -- a shortened
  // one pasted into a send field would address nothing.
  const handleCopyPrincipal = async () => {
    await copyText(principal)
    setCopiedPrincipal(true)
    setTimeout(() => setCopiedPrincipal(false), 1500)
  }

  const handleCheck = async () => {
    if (!username.trim()) { setCheckResult(null); return }
    const available = await onCheckUsername(username.trim())
    setCheckResult(available)
  }

  const trimmed = username.trim()
  const tooShortToClaim =
    trimmed !== "" && trimmed.length < USERNAME_FREE_MIN_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = username.trim()
    if (!name) { setError("Username is required"); return }
    // Checked here so a short name explains itself and offers the buy path,
    // rather than costing a round trip to learn it is not free.
    const invalid = validateFreeUsername(name)
    if (invalid) { setError(invalid); return }
    setLoading(true)
    const err = await onUpdateUsername(name)
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
          <button
            type="button"
            onClick={handleCopyPrincipal}
            aria-label="Copy principal"
            className="flex w-full items-center gap-2 rounded-lg text-left transition-colors hover:bg-accent active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1 truncate font-mono text-sm">
              {formatPrincipal(principal)}
            </span>
            <HugeiconsIcon
              icon={copiedPrincipal ? Tick02Icon : Copy01Icon}
              className={
                copiedPrincipal
                  ? "size-4 shrink-0 text-primary"
                  : "size-4 shrink-0 text-muted-foreground"
              }
            />
          </button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">User ID</Label>
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
        </div>
        <Separator />
        {claimed ? (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Username</Label>
            <p className="text-sm font-medium">@{claimed}</p>
            <p className="text-xs text-muted-foreground">
              Usernames are permanent. People send you funds at this name, so it
              cannot be changed or transferred.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Choose a username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setCheckResult(null) }}
                  onBlur={handleCheck}
                  maxLength={USERNAME_MAX_LENGTH}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {checkResult === true && <HugeiconsIcon icon={Tick02Icon} className="h-5 w-5 text-success" />}
                {checkResult === false && <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-destructive" />}
              </div>
              {checkResult === true && !tooShortToClaim && <p className="text-xs text-success">Username is available</p>}
              {checkResult === false && <p className="text-xs text-destructive">Username is taken</p>}
              {tooShortToClaim ? (
                <p className="text-xs text-muted-foreground">
                  Free usernames need {USERNAME_FREE_MIN_LENGTH}+ characters.{" "}
                  <Link href="/username" className="font-medium text-primary underline underline-offset-2">
                    Buy a shorter one
                  </Link>
                  .
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {USERNAME_FREE_MIN_LENGTH}-{USERNAME_MAX_LENGTH} characters, free.
                  You can only set this once — choose carefully.
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Claim Username"}
            </Button>
          </form>
        )}
        <Link
          href="/username"
          className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-2.5 transition-colors hover:bg-accent"
        >
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4 shrink-0" />
            Want something shorter? Buy a premium username
          </span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  )
}
