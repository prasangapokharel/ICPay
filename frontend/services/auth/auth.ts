import { AuthClient } from "@dfinity/auth-client"
import { getIdentityProvider } from "@/services/icp"
import type { Identity } from "@dfinity/agent"

export async function createAuthClient(): Promise<AuthClient> {
  return AuthClient.create({
    idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
  })
}

export async function login(): Promise<Identity | null> {
  const authClient = await createAuthClient()

  return new Promise((resolve) => {
    authClient.login({
      identityProvider: getIdentityProvider(),
      onSuccess: async () => {
        const identity = authClient.getIdentity()
        resolve(identity)
      },
      onError: (error) => {
        console.error("II login error:", error)
        resolve(null)
      },
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
