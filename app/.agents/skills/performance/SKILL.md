---
name: performance
description: Performance rules for ICPay mobile — lists, query cost, images, memoization. Use when lists, polling, images, or re-renders are in play.
---

# Performance

Performance is a requirement, not an afterthought.

Prefer:

- FlatList for large lists
- memoization only when profiling justifies it
- stable callbacks when needed
- optimized images
- pagination
- incremental loading
- cached canister data

Avoid premature optimization. Do not add `useMemo`, `useCallback`, or `memo` everywhere. Optimize measured bottlenecks.

Avoid unnecessary re-renders by keeping state close to where it is used.

Never store derived values in state when they can be calculated.

```ts
const total = items.reduce((sum, item) => sum + item.amount, 0);
```

---

## ICPay cost model

Queries are free. Updates cost cycles and ~2s.

- Refresh live ICP with `icrc1_balance_of`, not `getDashboard` on every focus.
- Paginate `getTransactions` (page size 20, max 50).
- Parallelize ledger metadata and balances on wallet load. Cap fan-out.
- Swap quotes: ICPSwap queries only. Do not hit backend `getSwapQuote`.
- `getSettings` is an update — cache on device.
- Never poll updates. Never loop keystroke-driven canister calls.

Images: sized assets, no full-resolution remote logos in lists. Cache remote token logos.
