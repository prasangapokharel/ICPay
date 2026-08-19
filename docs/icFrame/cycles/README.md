# Cycles guide

Cycles are the gas of the Internet Computer. Your canister stops working at zero
— stable memory and every user record are deleted.

---

## Economics (quick)

| Activity | Cost |
|---|---|
| Query calls | **Free** |
| Update calls | ~0.5–100M cycles per call (depends on work) |
| Idle burn | ~45k cycles/second (~3.9B/day) |
| HTTP outcalls | Variable + significant |

A canister with no traffic still burns cycles 24/7.

---

## Monitoring

```bash
npm run ci cycles:balance
npm run ci canister:status
```

`cycles:balance` reports runway above the **freezing threshold** (30 days idle
burn reserved). Below that, update calls are rejected.

Set a calendar reminder or alert when runway drops below 30 days.

---

## Top-up workflow

This framework uses the **cycles ledger**, not a cycles wallet canister.

```bash
# 1. Get the address to send ICP to
npm run ci cycles:address

# 2. Send ICP from any wallet to that address

# 3. Convert ICP → cycles on the ledger
npm run ci cycles:convert 1          # 1 ICP

# 4. Deposit cycles into your app canister
npm run ci cycles:topup 1500000000000
```

`dfx canister deposit-cycles` does **not** work without a cycles wallet — use
`cycles:topup` instead.

---

## Which commands cost money

| Tier | Commands |
|---|---|
| Free | `cycles:balance`, `canister:status`, `backend:hash`, `backend:logs`, `backend:test`, `backend:build`, `frontend:build`, `canister:call` (query) |
| Canister cycles | `backend:deploy`, `frontend:deploy`, `canister:call --update` |
| Operator ICP | `cycles:convert`, `ledger:transfer` |
| Ledger → canister | `cycles:topup` |

Every mainnet write stops at `confirm()` — accidental deploys in scripts are blocked.

---

## Reducing burn

1. **Batch work** — one update with many items beats N updates
2. **Prefer queries** for read-only endpoints
3. **Avoid polling** — use timers or client-side SWR with sane intervals
4. **Cap test loops** — integration tests on mainnet: 10–30 calls max
5. **Right-size memory** — stable structures that grow unbounded increase idle cost

---

## Emergency

Canister frozen (updates rejected, queries may still work):

```bash
npm run ci cycles:convert 2
npm run ci cycles:topup 5000000000000
npm run ci cycles:balance
```

Canister deleted (id returns "canister not found"):

There is no recovery. Redeploy creates an empty canister with a **new id**.
This is why monitoring runway matters.

---

## Local replica

Local cycles are free and unlimited:

```bash
npm run ci cycles:balance -- --local
npm run ci backend:deploy -- --local
```

Use local for development; mainnet only for production deploys.
