---
name: internet-identity-auth
description: >-
  Internet Identity authentication and the network-consistency constraint.
  Use when wiring II login, debugging "Invalid delegation" or "Invalid
  canister signature", configuring local vs mainnet targets, or handling
  session restore in a frontend.
---

# Internet Identity Auth

## The delegation constraint

**A delegation signed by mainnet Internet Identity cannot be verified by a
local replica.** Different root key. It surfaces as:

```
Invalid delegation: Invalid canister signature ...
Invalid combined threshold signature
```

This is protocol-level and unpatchable. No code change fixes it.

Therefore: **host, canister and identity provider must always name the same
network.** These three must never drift, so derive all of them from one
variable rather than setting them independently:

```ts
const isLocal = process.env.NEXT_PUBLIC_IC_NETWORK !== "ic"
const host   = isLocal ? "http://127.0.0.1:4943" : "https://icp-api.io"
const iiUrl  = isLocal ? `http://${LOCAL_II_CANISTER}.localhost:4943` : "https://id.ai"
```

Any config that lets one be set without the others is a latent outage. Setting
a mainnet II URL while pointed at a local replica breaks login completely.

**Mainnet II cannot be tested locally.** Local testing uses the local II
canister; mainnet II is exercised only against a deployed canister. Do not
attempt to work around this.

## Session restore must create, not just read

The trap: login is an update that *creates* the user record, while session
restore often calls a read-only query. Restore a cached delegation, call a
query, and you have an authenticated caller with no record — the UI looks
signed in against a canister that has never heard of them.

Make login idempotent and call it on restore too:

```ts
// on restore — not getUser()
const result = await actor.login()
```

Backend `login` returns the existing record if present, creates it if not.

This failure is easy to miss because a ledger-derived balance still renders
(funds live in a derived subaccount, independent of the user map), so the app
looks healthy until an operation needs the record. See `ledger-integration`.

## Self-healing sessions

A stored delegation can be expired or signed by the wrong network. Probe it on
startup and, on failure, discard it and sign the user out rather than surfacing
an opaque 400:

```ts
try {
  await actor.login()
} catch {
  await authClient.logout()   // stale or wrong-network delegation
}
```

## Caller verification

Every public update must destructure and verify `{ caller }`. Never accept a
principal as a parameter for authorization — a caller can pass any value.

```motoko
public shared ({ caller }) func withdraw(amount : Nat) : async Result {
  if (Principal.isAnonymous(caller)) return #err("Unauthorized");
```

Reject the anonymous principal explicitly. An unauthenticated frontend still
reaches the canister, as `2vxsx-fae`.

## Per-identity client cache

Any client cache keyed without the principal will serve one user's data to
another after an identity switch. Include the principal in every cache key, and
clear the whole cache on logout — a module-global cache outlives the identity:

```ts
const keyFor = (identity, ...parts) =>
  identity ? [...parts, identity.getPrincipal().toText()] : null
```

Values that are derived and immutable (a deposit address) can cache for the
session. Balances and history cannot.

## Rules

- Internet Identity only. Never store passwords, seed phrases or private keys.
- Authorize on the backend. Frontend checks are UX, not security.
- Never trust a principal supplied as an argument.
