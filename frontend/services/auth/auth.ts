import type { Identity } from "@icp-sdk/core/agent"
import { AuthClient, type OpenIdProvider } from "@icp-sdk/auth/client"
import { getIdentityProvider, getDerivationOrigin } from "@/services/icp"
import { getWalletActor, clearActorCache } from "@/services/wallet"
import {
  DELEGATION_TTL,
  POPUP_FEATURES,
} from "@/lib/auth/config"
import {
  prefersRedirectTransport,
  markRedirectPending,
  clearRedirectPending,
  hasRedirectPending,
  isInternetIdentityReturn,
  clearInternetIdentityReturnHash,
} from "@/lib/auth/transport"
import { finishAttributeVerification, startAttributeRequest } from "@/services/auth/attributes"

export type LoginOptions = {
  openIdProvider?: OpenIdProvider
  transport?: "window" | "redirect"
}

let clientPromise: Promise<AuthClient> | null = null
let readyClient: AuthClient | null = null

function wantsRedirectTransport(options?: LoginOptions): boolean {
  if (options?.transport === "window") return false
  if (options?.transport === "redirect") return true
  return prefersRedirectTransport()
}

function clientOptions(options?: LoginOptions) {
  const redirect = wantsRedirectTransport(options)
  return {
    identityProvider: getIdentityProvider(),
    derivationOrigin: getDerivationOrigin(),
    idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
    windowOpenerFeatures: POPUP_FEATURES,
    transport: redirect ? ("redirect" as const) : ("window" as const),
    ...(options?.openIdProvider ? { openIdProvider: options.openIdProvider } : {}),
  }
}

function signInOptions() {
  return {
    maxTimeToLive: DELEGATION_TTL,
  }
}

function ensureDefaultClient(): AuthClient {
  readyClient ??= new AuthClient(clientOptions())
  clientPromise ??= Promise.resolve(readyClient)
  return readyClient
}

function createClient(options?: LoginOptions): AuthClient {
  if (!options?.openIdProvider && !wantsRedirectTransport(options)) {
    return ensureDefaultClient()
  }
  return new AuthClient(clientOptions(options))
}

export async function createAuthClient(): Promise<AuthClient> {
  return ensureDefaultClient()
}

export class PopupBlockedError extends Error {
  constructor() {
    super("Popup blocked. Allow popups for this site, then try again.")
    this.name = "PopupBlockedError"
  }
}

async function signInWithAttributes(
  authClient: AuthClient,
  options?: LoginOptions,
): Promise<Identity | null> {
  const redirect = wantsRedirectTransport(options)

  if (redirect) {
    const identity = await authClient.signIn(signInOptions())
    return identity
  }

  const attributesPromise = startAttributeRequest(authClient, options?.openIdProvider).catch(
    () => null,
  )
  const identity = await authClient.signIn(signInOptions())
  const attributes = await attributesPromise
  if (attributes) {
    try {
      await finishAttributeVerification(identity, attributes)
    } catch (e) {
      console.warn("II attribute verification skipped:", e)
    }
  }
  return identity
}

export async function resumeRedirectSignIn(): Promise<Identity | null> {
  if (!hasRedirectPending() && !isInternetIdentityReturn()) return null
  try {
    const options: LoginOptions = { transport: "redirect" }
    const identity = await signInWithAttributes(
      new AuthClient(clientOptions(options)),
      options,
    )
    clearRedirectPending()
    clearInternetIdentityReturnHash()
    return identity
  } catch (e) {
    clearRedirectPending()
    console.error("II redirect resume error:", e)
    return null
  }
}

export async function login(options?: LoginOptions): Promise<Identity | null> {
  if (wantsRedirectTransport(options)) markRedirectPending()
  const authClient = createClient(options)

  try {
    const identity = await signInWithAttributes(authClient, options)
    if (wantsRedirectTransport(options)) {
      clearRedirectPending()
      clearInternetIdentityReturnHash()
    }
    return identity
  } catch (e) {
    if (wantsRedirectTransport(options)) clearRedirectPending()
    console.error("II login error:", e)
    if (e instanceof Error && /popup|blocked/i.test(e.message)) {
      throw new PopupBlockedError()
    }
    return null
  }
}

export async function logout(): Promise<void> {
  const authClient = await createAuthClient()
  await authClient.signOut({ returnTo: "/login" })

  clientPromise = null
  readyClient = null
  void createAuthClient()
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ])
}

export async function openBackendSession(identity: Identity): Promise<void> {
  const actor = await getWalletActor(identity)
  await withTimeout(actor.login(), 20_000)
}

export async function discardRejectedSession(): Promise<void> {
  await logout()
  clearActorCache()
}
