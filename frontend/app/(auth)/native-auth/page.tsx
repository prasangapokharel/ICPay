"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Delegation, DelegationChain } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import { getDerivationOrigin, getIdentityProvider } from "@/services/icp"

const TTL = 2_592_000_000_000_000n // 30 days
const POPUP_W = 432
const POPUP_H = 620

type IiDelegation = {
  signature: unknown
  delegation: { pubkey: unknown; expiration: unknown; targets?: unknown }
}

type IiSuccess = {
  kind?: string
  userPublicKey?: unknown
  publicKey?: unknown
  delegations?: IiDelegation[]
}

function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  if (Array.isArray(value)) return Uint8Array.from(value as number[])
  if (value && typeof value === "object" && "length" in value) {
    return Uint8Array.from(value as ArrayLike<number>)
  }
  if (typeof value === "string") {
    const hex = value.replace(/^0x/i, "")
    if (hex.length >= 64 && hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
      const out = new Uint8Array(hex.length / 2)
      for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      return out
    }
  }
  throw new Error("Invalid key format.")
}

function toExpiration(value: unknown): bigint {
  if (typeof value === "bigint") return value
  if (typeof value === "number") return BigInt(value)
  if (typeof value === "string") {
    const raw = value.replace(/^0x/i, "")
    return /^[0-9]+$/.test(value) ? BigInt(value) : BigInt(`0x${raw}`)
  }
  throw new Error("Invalid expiration.")
}

function toTargets(value: unknown): Principal[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  return value.map((item) => {
    if (typeof item === "string") {
      try {
        return Principal.fromText(item)
      } catch {
        return Principal.fromHex(item)
      }
    }
    return Principal.fromUint8Array(toBytes(item))
  })
}

function chainFromIiSuccess(data: IiSuccess): DelegationChain {
  const delegations = (data.delegations ?? []).map((item) => ({
    delegation: new Delegation(
      toBytes(item.delegation.pubkey),
      toExpiration(item.delegation.expiration),
      toTargets(item.delegation.targets),
    ),
    signature: toBytes(item.signature) as never,
  }))
  return DelegationChain.fromDelegations(delegations, toBytes(data.userPublicKey ?? data.publicKey) as never)
}

function parseHexKey(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, "").trim()
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export default function NativeAuthBridgePage() {
  const [status, setStatus] = useState<"ready" | "authenticating" | "redirecting" | "error">("ready")
  const [error, setError] = useState<string | null>(null)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  const autoTriggered = useRef(false)

  const params = useMemo(() => {
    if (typeof window === "undefined") return { appKey: null, redirect: null, provider: null }
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash
    const sp = new URLSearchParams(hash)
    return {
      appKey: sp.get("appKey"),
      redirect: sp.get("redirect") || "icpay://ii-callback",
      provider: sp.get("provider"),
      openIdProvider: sp.get("openIdProvider"),
    }
  }, [])

  const startAuth = useCallback(() => {
    setError(null)
    if (!params.appKey) {
      setStatus("error")
      setError("Missing mobile app session key. Please return to the ICPay app and try again.")
      return
    }

    let sessionKeyBytes: Uint8Array
    try {
      sessionKeyBytes = parseHexKey(params.appKey)
    } catch {
      setStatus("error")
      setError("Invalid session key format from mobile app.")
      return
    }

    setStatus("authenticating")

    const identityProvider = params.provider ?? getIdentityProvider()
    const authorizeUrl = identityProvider.includes("#") ? identityProvider : `${identityProvider}/#authorize`
    const derivationOrigin = getDerivationOrigin()

    const left = Math.round(window.screenX + (window.outerWidth - POPUP_W) / 2)
    const top = Math.round(window.screenY + (window.outerHeight - POPUP_H) / 2)
    const popup = window.open(
      authorizeUrl,
      "icpay-native-auth",
      `popup=yes,width=${POPUP_W},height=${POPUP_H},left=${left},top=${top}`,
    )

    if (!popup) {
      setStatus("ready")
      setError("Popup was blocked by your browser. Please tap 'Connect with Internet Identity' below to continue.")
      return
    }

    let settled = false

    const cleanup = () => {
      window.removeEventListener("message", onMessage)
      clearInterval(checkClosed)
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data as IiSuccess | null
        if (!data || typeof data !== "object") return

        if (data.kind === "authorize-ready") {
          popup.postMessage(
            {
              kind: "authorize-client",
              sessionPublicKey: sessionKeyBytes,
              maxTimeToLive: TTL,
              ...(derivationOrigin ? { derivationOrigin } : {}),
            },
            event.origin,
          )
          return
        }

        if (data.kind === "authorize-client-failure") {
          if (settled) return
          settled = true
          cleanup()
          popup.close()
          setStatus("ready")
          setError("Internet Identity authorization was cancelled. Please try again.")
          return
        }

        if (data.kind === "authorize-client-success" && data.delegations) {
          if (settled) return
          settled = true
          cleanup()
          popup.close()

          setStatus("redirecting")
          const chain = chainFromIiSuccess(data)
          const chainJson = JSON.stringify(chain.toJSON())
          const callbackUrl = `${params.redirect}#delegation=${encodeURIComponent(chainJson)}`
          setReturnUrl(callbackUrl)

          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = callbackUrl
        }
      } catch (err) {
        if (settled) return
        settled = true
        cleanup()
        setStatus("error")
        setError(err instanceof Error ? err.message : "Failed to process Internet Identity session.")
      }
    }

    window.addEventListener("message", onMessage)

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        if (!settled) {
          settled = true
          cleanup()
          setStatus("ready")
        }
      }
    }, 500)
  }, [params])

  useEffect(() => {
    if (autoTriggered.current) return
    autoTriggered.current = true
    const t = setTimeout(() => {
      startAuth()
    }, 300)
    return () => clearTimeout(t)
  }, [startAuth])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Image
          src={APP_LOGO}
          alt={APP_LOGO_ALT}
          width={40}
          height={40}
          priority
          className="size-10 object-contain"
        />
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {status === "redirecting" ? "Connecting to ICPay..." : "Internet Identity"}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {status === "redirecting"
          ? "Returning to the mobile app with your secure session."
          : status === "authenticating"
            ? "Complete sign-in in the Internet Identity window..."
            : "Sign in with your passkey or Internet Identity to access your mobile wallet."}
      </p>

      {error ? (
        <Alert variant="destructive" className="mt-6 text-left">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8 flex w-full flex-col gap-3">
        {status === "authenticating" ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Spinner className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Authenticating...</span>
          </div>
        ) : null}

        {status === "redirecting" ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-5 text-primary" />
            {returnUrl ? (
              <a
                href={returnUrl}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Open ICPay App
              </a>
            ) : null}
          </div>
        ) : null}

        {status === "ready" || status === "error" ? (
          <Button size="lg" className="w-full" onClick={startAuth}>
            Connect with Internet Identity
          </Button>
        ) : null}
      </div>
    </div>
  )
}
