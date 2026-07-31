import { AuthClient } from "@dfinity/auth-client"
import { getIdentityProvider } from "@/services/icp"
import type { Identity } from "@dfinity/agent"

let clientPromise: Promise<AuthClient> | null = null

export async function createAuthClient(): Promise<AuthClient> {
  // Cached because AuthClient.create() reads IndexedDB. login() must not await
  // that work before window.open(): the async gap loses the user gesture and
  // the browser blocks the popup. Warmed at mount so login() opens instantly.
  clientPromise ??= AuthClient.create({
    idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
  })
  return clientPromise
}

export class PopupBlockedError extends Error {
  constructor() {
    super("Popup blocked. Allow popups for this site, then try again.")
    this.name = "PopupBlockedError"
  }
}

export async function login(): Promise<Identity | null> {
  const authClient = await createAuthClient()

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
        identityProvider: getIdentityProvider(),
        onSuccess: () => finish(authClient.getIdentity()),
        onError: (error) => {
          console.error("II login error:", error)
          finish(null)
        },
      })
      .then(() => {
        // window.open() returns null when blocked, leaving _idpWindow undefined.
        // auth-client's own interrupt check is guarded on that handle existing,
        // so it stops immediately and neither callback ever fires -- the promise
        // would hang forever and the button would spin with no way to recover.
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
}

export async function getIdentity(): Promise<Identity | undefined> {
  const authClient = await createAuthClient()
  const identity = authClient.getIdentity()
  if (identity.getPrincipal().isAnonymous()) {
    return undefined
  }
  return identity
}

export async function isAuthenticated(): Promise<boolean> {
  const authClient = await createAuthClient()
  return await authClient.isAuthenticated()
}
