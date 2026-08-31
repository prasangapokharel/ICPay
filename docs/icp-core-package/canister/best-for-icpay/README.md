# `@icp-sdk/canisters` — what fits ICPay

Planning doc for which SDK features to use, what is already shipped, and what needs backend work.

**ICPay model:** custodial wallet. User funds sit in a **per-user subaccount** of the backend canister. Only the backend can move custodial balances. The user's Internet Identity principal is used for **auth**, not for signing every ledger call from the browser.

That constraint splits every SDK feature into three buckets.

---

## Decision matrix

| Bucket | Meaning | Build where |
|---|---|---|
| **A — Frontend only** | Read-only or uses the user's principal for display; no custodial funds at risk | `frontend/services/` + SWR hooks |
| **B — Backend required** | Moves money, votes with staked tokens, or needs a controller key | `backend/src/` new endpoint + test |
| **C — Skip / later** | Wrong product fit, blocked on Phase 7, or redundant | Roadmap / refused list |

---

## Already shipped (production)

| Feature | SDK module | Bucket | ICPay location | Notes |
|---|---|---|---|---|
| Token metadata + balance | `ledger/icrc` | A | `services/tokens.ts` | SNS discovery via `SnsWasmCanister.listSnses` |
| Multi-token send | `ledger/icrc` | B | `backend` + `services/ledger/icrc.ts` | Backend signs transfer from subaccount |
| ICP account ID deposit | `ledger/icp` | A | `services/account/account.ts` | Display only |
| ckBTC / ckETH deposit addresses | `ckbtc`, `cketh` | A | `services/chainkey/deposits.ts` | Native address per user principal |
| Chain-key status panel | `ckbtc`, `cketh` | A | `services/chainkey/status.ts` | Pending BTC, withdrawal fees, ETH gas |
| Per-token deposit page | above + ICRC address | A | `/token/{id}/deposit` | ICPay tab + native tab for ck assets |
| ICRC payment QR decode | `ledger/icrc` `decodePayment` | A | `lib/wallet/paymentUri.ts` | Scan + send forms |
| Per-token on-chain history | `ledger/icrc` index | A | `services/ledger/icrcHistory.ts` | Only ledgers with index canister |
| SNS token metadata | `sns` | A | `services/governance/governance.ts` `fetchSnsMeta` | Name, description, URL |
| Governance feed (read-only) | `nns`, `sns` | A | `/governance` | Pagination + detail drawer; **no voting** |
| ICP price (fallback) | `cmc` | A | `services/market/icpPrice.ts` | On-chain rate when CoinGecko fails |
| Canister status (ops) | `ic-management` | A | `services/ops/canister.ts` | Internal / transparency tooling |
| Sweep outside balance | `ledger/icrc` | B | `services/sweep/sweep.ts` + backend | User principal → custodial subaccount |

---

## Recommended next — frontend only (Bucket A)

Low risk, no backend deploy. Aligns with current roadmap before Phase 7.

| Priority | Feature | SDK APIs | UI idea | Effort |
|---|---|---|---|---|
| **P1** | ckBTC “Check deposit” on deposit page | `CkBtcMinterCanister.updateBalance` | Button on native tab — user signs update | Small |
| **P1** | Withdrawal status for ckBTC | `retrieveBtcStatusV2ByAccount` | List pending BTC sends on token page | Small |
| **P2** | ICRC-21 consent preview | `IcrcLedgerCanister.consentMessage` | Show human text before confirm on send | Medium |
| **P2** | Token standards badge (optional) | `supportedStandards` | Small chips ICRC-1/2/3 if user wants them back | Tiny |
| **P2** | SNS swap history link | `SnsSwapCanister` read | Link to swap canister state for launched tokens | Small |
| **P3** | More governance filters | `listProposals` with `includeStatus` | Tabs: Open / Executed / Rejected | Small |
| **P3** | Subaccount list | `IcrcIndexCanister.listSubaccounts` | Power-user debug on profile | Tiny |

**SWR pattern (keep this):**

```ts
useSWR("governance-nns", () => fetchOpenNnsProposals(identity), {
  revalidateOnFocus: false,
})
```

- Key = stable string or tuple `["sns-meta", ledgerId]`
- `null` key when inputs missing → no fetch
- `revalidateOnFocus: false` on heavy canister lists
- Service layer in `frontend/services/` — never call canisters from components

---

## Needs backend (Bucket B) — do not wire from browser alone

| Feature | Why backend | SDK entry point | Phase |
|---|---|---|---|
| ckBTC / ckETH **withdraw to native chain** | Burns custodial ck tokens; needs backend approval + ledger sign | `retrieveBtc`, `retrieveEth` | After Phase 7 security review |
| NNS / SNS **voting** | Neurons are tied to principal; custodial ICP cannot vote as user today | `registerVote`, SNS vote APIs | Phase 7+ (governance UX) |
| Stake neuron from wallet | Moves ICP out of custody | `NnsGovernanceCanister.stakeNeuron` | Not planned — conflicts with custody |
| ICRC-2 approve for swaps | Backend already signs swaps; extend `LedgerService` | `approve`, `transferFrom` | Phase 5 extension if ICPSwap needs it |
| Cycles top-up from wallet | User-facing cycle purchase | `CyclesLedgerCanister` | Low priority — ops CLI exists |
| Launch canister from UI | Controller keys | `IcManagementCanister` | Bucket product, not wallet |

---

## Skip or defer (Bucket C)

| Feature | Reason |
|---|---|
| `NnsGenesisTokenCanister` | Historical genesis claims — not ICPay users |
| `IcrcNftLedgerCanister` | NFTs explicitly refused in roadmap |
| `assets` AssetManager | ICPay Bucket is custom Motoko storage; don't duplicate |
| Cross-chain bridges beyond ckBTC/ckETH | Refused — chain-key tokens cover BTC/ETH |
| Non-custodial neuron management | Different product |

---

## Custodial rules (read before adding any SDK call)

1. **Deposits** — External chain → user's ck address OR ICRC transfer → custodial subaccount. Both are safe to show in UI.
2. **Reads** — Any query/update that only **reads** state is safe from the browser with the user's agent.
3. **Writes that move custodial funds** — Must go through `backend` actor (`Transfer`, `Withdraw`, etc.). Never call `IcrcLedgerCanister.transfer` from the browser for the custodial subaccount.
4. **Writes on user's own principal** — `updateBalance` for ckBTC credits the **caller's** ckBTC balance at their principal, not the custodial subaccount. Today ICPay shows native addresses for the user's principal; crediting ckBTC there does **not** auto-credit the ICPay wallet unless you add a sweep path.
5. **Governance** — Read-only is fine. Voting requires neuron on user's principal — document as “preview only” until Phase 7.

---

## Suggested build order (your plan)

### Sprint 1 — polish what's live
- [ ] ckBTC “Check deposit” button (`updateBalance`)
- [ ] ckBTC withdrawal status list on token page
- [ ] Governance: filter by status (Open / Executed)
- [ ] Prefetch `/governance` on settings hover (already wired for routes)

### Sprint 2 — trust + clarity
- [ ] ICRC-21 consent message on send confirm drawer
- [ ] Link governance proposals to SNS project URL when `fetchSnsMeta` has `url`
- [ ] Transaction history: pagination on `icrcHistory` (index returns pages)

### Sprint 3 — after Phase 7 (custody decentralization)
- [ ] Voting UX (if custody model allows neuron delegation)
- [ ] ckBTC/ckETH withdraw to native chain from custodial balance
- [ ] Certified queries toggle for transparency page

---

## File layout convention

When adding a new SDK integration:

```
frontend/
  services/<domain>/<name>.ts    # pure canister calls, no React
  hooks/<domain>/use<Name>.ts    # SWR wrapper
  components/<domain>/           # UI only
```

One service function = one responsibility. Cap mainnet call loops at ~10–30 per user action (cycles cost).

---

## Quick reference — which import for what

| I want to… | Import |
|---|---|
| Send any ICRC token | `ledger/icrc` → backend `LedgerService` |
| Show token logo/name | `ledger/icrc` `metadata` / `mapTokenMetadata` |
| Show tx history | `ledger/icrc` `IcrcIndexCanister.getTransactions` |
| Parse payment QR | `ledger/icrc` `decodePayment` |
| BTC deposit address | `ckbtc` `getBtcAddress` |
| ETH deposit address | `cketh` `getEthAddress` |
| Check BTC arrived | `ckbtc` `updateBalance` + `BitcoinCanister.getBalanceQuery` |
| List NNS proposals | `nns` `NnsGovernanceCanister.listProposals` |
| List SNS proposals | `sns` `initSnsWrapper` → `listProposals` |
| Find all SNS tokens | `nns` `SnsWasmCanister.listSnses` |
| ICP price on-chain | `cmc` `getIcpToCyclesConversionRate` |
| Canister cycles/memory | `ic-management` `canisterStatus` |

---

## Related docs

| Path | Contents |
|---|---|
| `docs/icp-core-package/canister/features/README.md` | Full API/feature list per module |
| `docs/roadmap/roadmap.md` | ICPay phase plan (authoritative) |
| `.claude/skills/icpay-roadmap/SKILL.md` | Shipped / next / refused summary |
| `frontend/AGENTS.md` | Frontend verify commands |
