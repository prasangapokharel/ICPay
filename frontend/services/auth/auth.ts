import { AuthClient } from "@dfinity/auth-client"
import { getIdentityProvider, getDerivationOrigin } from "@/services/icp"
import type { Identity } from "@dfinity/agent"

let clientPromise: Promise<AuthClient> | null = null
let readyClient: AuthClient | null = null

export async function createAuthClient(): Promise<AuthClient> {
  // Cached because AuthClient.create() reads IndexedDB. login() must reach
  // window.open() with no await in front of it, so the resolved instance is
  // also kept synchronously accessible via readyClient.
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

export function login(): Promise<Identity | null> {
  // Deliberately NOT async. auth-client calls window.open() synchronously, and a
  // popup only opens if the browser still sees the click as the active user
  // gesture. Any await here -- even on an already-resolved promise -- defers to
  // a microtask and can spend that activation.
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
    authClient      .login({
        identityProvider: getIdentityProvider(),
        derivationOrigin: getDerivationOrigin(),
        onSuccess: () => finish(authClient.getIdentity()),
        onError: (error) => {
          console.error("II login error:", error)
          finish(null)
        },
      })
      .then(() => {
        // window.open() returns null when blocked, leaving _idpWindow undefined.
        // auth-client's own interrupt check is guarded on that handle existing,
        // so neither callback ever fires and the promise would hang forever.
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

  // logout() deletes the stored base key but leaves it on the instance, and a
  // later login only re-persists the delegation. Reusing this client would
  // leave IndexedDB holding a chain with no key to match it, and the next
  // reload silently falls back to anonymous. Drop it and prime a fresh one so
  // login() -- which needs readyClient synchronously -- is ready on arrival.
  clientPromise = null
  readyClient = null
  void createAuthClient()
}
