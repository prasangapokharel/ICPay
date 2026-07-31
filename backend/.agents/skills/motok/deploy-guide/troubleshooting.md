# Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `IC0512` not a controller | dfx identity not in controller list | Add principal in wallet.ic0.app |
| `missing initializer _` on install | Uninitialized `transient var` in actor | Build services on demand |
| `dfx build` migration errors | dfx moc too old | Use `scripts/build-lottery.sh` |
| `Module hash: None` | Wasm never installed | `dfx canister install` |
| Frontend `is not iterable` | Agent v3 unwrapping | Use `unwrapResult` / `unwrapOpt` |
| Upgrade reverts | Migration trap | Fix migration types, rebuild |
| Memory-incompatible upgrade | Changed stable type in place | Parallel store + migration |
| Candid mismatch | Stale IDL | Regenerate from build `--idl` |
| Local agent rejects cert | Missing root key | `agent.fetchRootKey()` on local |
| Vercel 404 | Wrong root directory | Set Root Directory = `frontend` |
| Deposits not crediting | Index / timer / min amount | Call `processIncomingDeposits`; check ≥1 ICP |
| Site shows offline | Missing Vercel env vars | Set `NEXT_PUBLIC_LOTTERY_CANISTER_ID` |

## Vercel 404

Repo root has no Next.js app. **Settings → General → Root Directory → `frontend`** → Redeploy.

## Cycles low

```bash
dfx canister status ulahq-iyaaa-aaaao-bbcoq-cai --network ic
```

Top up via wallet.ic0.app.
