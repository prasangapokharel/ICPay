# Local Deploy

## Start replica

```bash
dfx start --background --clean
dfx deploy
```

## Initialize (if your actor uses `ensureInitialized`)

```bash
dfx canister call lottery initialize
dfx canister call lottery health --query
```

## Smoke tests

```bash
dfx canister call lottery getCurrentRound --query
dfx canister call lottery getConfig --query
```

## Frontend env (local)

`frontend/.env.local`:

```env
NEXT_PUBLIC_LOTTERY_CANISTER_ID=<from .dfx/local/canister_ids.json>
NEXT_PUBLIC_IC_HOST=http://127.0.0.1:4943
NEXT_PUBLIC_DFX_NETWORK=local
```

```bash
cd frontend && npm run dev
```

Agent must call `fetchRootKey()` when `IS_LOCAL` is true (handled in `frontend/lib/lottery/actor.ts`).

## Local ledger

`dfx.json` includes `icrc1_ledger` for local transfers. Mainnet uses remote ledger ID in `dfx.json` `remote.id.ic`.
