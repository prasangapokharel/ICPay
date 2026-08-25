import { HttpAgent, Actor } from "@icp-sdk/core/agent"
import { AttributesIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"
import type { Identity } from "@icp-sdk/core/agent"
import { AuthClient, scopedKeys, type OpenIdProvider } from "@icp-sdk/auth/client"
import { II_BACKEND_CANISTER_ID } from "@/lib/auth/config"
import { createAgent, getHost, getIsLocal, WALLET_CANISTER_ID } from "@/services/icp"
import { walletIdl } from "@/services/wallet"

function attributeKeys(openIdProvider?: OpenIdProvider): string[] {
  if (openIdProvider) {
    return [...scopedKeys({ openIdProvider, keys: ["name", "verified_email"] })]
  }
  return ["name", "verified_email"]
}

export function startAttributeRequest(
  authClient: AuthClient,
  openIdProvider?: OpenIdProvider,
) {
  const keys = attributeKeys(openIdProvider)
  const nonce = async () => {
    const agent = await HttpAgent.create({ host: getHost() })
    if (getIsLocal()) await agent.fetchRootKey()
    const actor = Actor.createActor(walletIdl, {
      agent,
      canisterId: WALLET_CANISTER_ID,
    })
    return actor._internet_identity_sign_in_start() as Promise<Uint8Array>
  }
  return authClient.requestAttributes({ keys, nonce })
}

export async function finishAttributeVerification(
  identity: Identity,
  attributes: { data: Uint8Array; signature: Uint8Array },
): Promise<void> {
  const wrapped = new AttributesIdentity({
    inner: identity,
    attributes,
    signer: { canisterId: Principal.fromText(II_BACKEND_CANISTER_ID) },
  })
  const agent = await createAgent(wrapped)
  const actor = Actor.createActor(walletIdl, {
    agent,
    canisterId: WALLET_CANISTER_ID,
  })
  const result = (await actor._internet_identity_sign_in_finish()) as
    | { ok: null }
    | { err: string }
  if ("err" in result) {
    throw new Error(typeof result.err === "string" ? result.err : "Attribute verification failed")
  }
}
