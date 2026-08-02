import { AuthClient } from "@dfinity/auth-client"
import { getIdentityProvider, getDerivationOrigin } from "@/services/icp"
import { getWalletActor, clearActorCache } from "@/services/wallet"
import type { Identity } from "@dfinity/agent"

let clientPromise: Promise<AuthClient> | null = null
let readyClient: AuthClient | null = null

export async function createAuthClient(): Promise<AuthClient> {
  // Cached because AuthClient.create() reads IndexedDB, and kept in readyClient
  // so login() can reach window.open() with no await in front of it.
  clientPromise ??= AuthClient.create({
    idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
  }).then((c) => {
    readyClient = c
    return c
  })
  return clientPromise
}

export class PopupBlockedError extends Error {
  constructor() {
    super("Popup blocked. Allow popups for this site, then try again.")
    this.name = "PopupBlockedError"
  }
}

export function login(provider?: string): Promise<Identity | null> {
  // Deliberately NOT async: auth-client calls window.open() synchronously, and
  // any await defers to a microtask that can spend the click's popup activation.
  const authClient = readyClient
  if (!authClient) {
    void createAuthClient()
    return Promise.reject(
      new Error("Still preparing sign-in. Please try again in a moment.")
    )
  }

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (identity: Identity | null) => {
      if (settled) return
      settled = true
      resolve(identity)
    }

    // auth-client polls for a user-dismissed popup and reports it through
    // onError, so no extra watchdog is needed for that case.
    authClient
      .login({
        identityProvider: provider ?? getIdentityProvider(),
        derivationOrigin: getDerivationOrigin(),
        onSuccess: () => finish(authClient.getIdentity()),
        onError: (error) => {
          console.error("II login error:", error)
          finish(null)
        },
      })
      .then(() => {
        // A blocked window leaves _idpWindow undefined, and auth-client guards
        // its interrupt check on that handle, so neither callback ever fires.
        const popup = (authClient as unknown as { _idpWindow?: Window })._idpWindow
        if (!popup && !settled) {
          settled = true
          reject(new PopupBlockedError())
        }
      })
      .catch((e) => {
        if (settled) return
        settled = true
        reject(e)
      })
  })
}

export async function logout(): Promise<void> {
  const authClient = await createAuthClient()
  await authClient.logout()

  // logout() drops the stored base key but leaves it on the instance, so reusing
  // this client would leave IndexedDB holding a chain with no matching key and
  // the next reload would silently fall back to anonymous.
  clientPromise = null
  readyClient = null
  void createAuthClient()
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    ),
  ])
}

// Creates the user record on first sign-in. Bounded because a hung boundary-node
// request would otherwise strand the app on its loading screen.
export async function openBackendSession(identity: Identity): Promise<void> {
  const actor = await getWalletActor(identity)
  await withTimeout(actor.login(), 20_000)
}

// Clears the delegation that the canister just rejected, so the next reload
// starts anonymous instead of retrying the same dead chain.
export async function discardRejectedSession(): Promise<void> {
  await logout()
  clearActorCache()
}
