# Frontend Connection

## Environment variables

| Variable | Mainnet | Local |
|----------|---------|-------|
| `NEXT_PUBLIC_LOTTERY_CANISTER_ID` | `ulahq-iyaaa-aaaao-bbcoq-cai` | local id from `.dfx/local/` |
| `NEXT_PUBLIC_IC_HOST` | `https://icp0.io` | `http://127.0.0.1:4943` |
| `NEXT_PUBLIC_DFX_NETWORK` | omit or `ic` | `local` |

Vercel: set env vars in project settings → redeploy.

Live: https://win-canister.vercel.app

## Vercel deploy

- **Root Directory:** `frontend`
- **Framework:** Next.js
- Env vars above for Production + Preview

## Agent v3 return values

`@dfinity/agent` v3 returns values **directly**, not `[value]`.

```typescript
export function unwrapResult<T>(result: unknown): T {
  if (Array.isArray(result) && result.length === 1) return result[0] as T
  return result as T
}

export function unwrapOpt<T>(result: unknown): T | null {
  if (result === null || result === undefined) return null
  if (!Array.isArray(result)) return result as T
  if (result.length === 0) return null
  if (result.length === 1) {
    const inner = result[0]
    return inner === null || inner === undefined ? null : (inner as T)
  }
  return result as T
}
```

**Wrong:** `const [x] = await actor.health()` → not iterable  
**Right:** `unwrapResult(await actor.health())`

## IDL sync

After wasm build, update `frontend/lib/lottery/idl.ts` from `.mops/.build/lottery.did` when API changes.

## Deposit UX

- No wallet connect required
- Users send ICP to canister **account ID** (hex on dashboard)
- Frontend polls canister every 5s for pool / activity
