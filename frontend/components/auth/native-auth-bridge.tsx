"use client"

import { useMemo, useState } from "react"
import { AuthClient } from "@icp-sdk/auth/client"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  Ed25519PublicKey,
} from "@icp-sdk/core/identity"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getDerivationOrigin, getIdentityProvider } from "@/services/icp"

const TTL = BigInt(8) * BigInt(3_600_000_000_000)
const CALLBACK = "icpay://ii-callback"

function readHash() {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.hash.replace(/^#/, ""))
}

function bytesToKey(hex: string) {
  const clean = hex.replace(/^0x/i, "")
  if (clean.length < 64 || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Invalid app key.")
  }
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return Ed25519PublicKey.from(bytes)
}

export function NativeAuthBridge() {
  const params = useMemo(() => readHash(), [])
  const appKey = params.get("appKey")
  const redirect = params.get("redirect") || CALLBACK
  const provider = params.get("provider") || undefined
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    !appKey || redirect !== CALLBACK ? "Open this page from the ICPay app." : null
  )

  const start = async () => {
    if (!appKey || redirect !== CALLBACK || busy) return
    setBusy(true)
    setError(null)
    try {
      const middle = Ed25519KeyIdentity.generate()
      const authClient = await AuthClient.create({
        identity: middle,
        keyType: "Ed25519",
        idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
      })
      await new Promise<void>((resolve, reject) => {
        void authClient.login({
          identityProvider: provider || getIdentityProvider(),
          derivationOrigin: getDerivationOrigin(),
          maxTimeToLive: TTL,
          onSuccess: () => resolve(),
          onError: (err) => reject(new Error(err || "Internet Identity closed.")),
        })
      })
      const identity = authClient.getIdentity()
      if (!(identity instanceof DelegationIdentity)) {
        throw new Error("Internet Identity did not return a delegation.")
      }
      const previous = identity.getDelegation()
      const last = previous.delegations.at(-1)
      const expiration = last
        ? new Date(Number(last.delegation.expiration / 1_000_000n))
        : new Date(Date.now() + 8 * 60 * 60 * 1000)
      const chain = await DelegationChain.create(middle, bytesToKey(appKey), expiration, {
        previous,
      })
      window.location.href = `${CALLBACK}#delegation=${encodeURIComponent(JSON.stringify(chain.toJSON()))}`
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold tracking-tight">Internet Identity</h1>
      <p className="text-sm text-muted-foreground">
        Sign in with id.ai to continue in the ICPay app. This page is the official web origin
        Internet Identity uses to derive your wallet principal.
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button size="lg" disabled={busy || !appKey || redirect !== CALLBACK} onClick={() => void start()}>
        {busy ? "Connecting…" : "Continue with Internet Identity"}
      </Button>
    </main>
  )
}
