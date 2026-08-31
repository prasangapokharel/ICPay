# `@icp-sdk/canisters` — feature map

Package: [`@icp-sdk/canisters`](https://www.npmjs.com/package/@icp-sdk/canisters) **v3.6.0** (pinned in `frontend/package.json`).

Peer deps: `@icp-sdk/core` + `@dfinity/utils`.  
Upstream: [dfinity/icp-js-canisters](https://github.com/dfinity/icp-js-canisters) — docs at [js.icp.build/canisters](https://js.icp.build/canisters/).

This file lists **every export path**, what it talks to on-chain, and the main APIs you get.

---

## Module overview

| Export path | On-chain target | Primary classes | What it is for |
|---|---|---|---|
| `@icp-sdk/canisters/ledger/icrc` | Any ICRC ledger + index | `IcrcLedgerCanister`, `IcrcIndexCanister`, `IcrcNftLedgerCanister` | Generic fungible tokens (ICP, ckBTC, SNS tokens, user-launched tokens) |
| `@icp-sdk/canisters/ledger/icp` | Official ICP ledger + index | `IcpLedgerCanister`, `IcpIndexCanister`, `AccountIdentifier` | Legacy ICP account IDs, subaccounts, ICP-specific helpers |
| `@icp-sdk/canisters/ledger/cycles` | Cycles ledger | `CyclesLedgerCanister` | Pay canisters in cycles from a ledger balance |
| `@icp-sdk/canisters/ckbtc` | ckBTC minter + Bitcoin API | `CkBtcMinterCanister`, `BitcoinCanister` | BTC ↔ ckBTC bridge |
| `@icp-sdk/canisters/cketh` | ckETH minter + orchestrator | `CkEthMinterCanister`, `CkEthOrchestratorCanister` | ETH ↔ ckETH bridge |
| `@icp-sdk/canisters/nns` | NNS governance + SNS wasm | `NnsGovernanceCanister`, `SnsWasmCanister`, `NnsGenesisTokenCanister` | Network governance, neuron ops, SNS registry |
| `@icp-sdk/canisters/sns` | Per-SNS root/governance/swap | `initSnsWrapper`, `SnsGovernanceCanister`, `SnsSwapCanister`, `SnsRootCanister` | SNS token metadata, proposals, swaps |
| `@icp-sdk/canisters/cmc` | Cycles minting canister | `CmcCanister` | ICP ↔ cycles conversion rate (on-chain price signal) |
| `@icp-sdk/canisters/ic-management` | Management canister | `IcManagementCanister` | Canister status, logs, install, snapshots |
| `@icp-sdk/canisters/assets` | Asset canister | `AssetManager` (store/upload helpers) | Host static files on an asset canister |

---

## 1. `ledger/icrc` — ICRC-1 / ICRC-2 / ICRC-3

**Use when:** any fungible token ledger (not just ICP).

### `IcrcLedgerCanister`

| Method | Type | Purpose |
|---|---|---|
| `metadata` | query | Name, symbol, decimals, logo |
| `transactionFee` | query | Live transfer fee |
| `transfer` | update | ICRC-1 send |
| `transferFrom` | update | ICRC-2 spend from allowance |
| `approve` | update | ICRC-2 allowance |
| `allowance` | query | Read allowance |
| `totalTokensSupply` | query | Total supply |
| `getBlocks` | query | Raw blocks (ICRC-3) |
| `getIndexPrincipal` | query | Find index canister for this ledger |
| `supportedStandards` | query | ICRC-1/2/3/21 flags |
| `consentMessage` | query | ICRC-21 human-readable consent text |

### `IcrcIndexCanister`

| Method | Type | Purpose |
|---|---|---|
| `getTransactions` | update | Account tx history (needs index canister) |
| `listSubaccounts` | query | Subaccounts seen by index |
| `ledgerId` | query | Back-link to ledger |
| `status` | query | Index sync status |

### Utilities

| Export | Purpose |
|---|---|
| `mapTokenMetadata` | Normalise `icrc1_metadata` into `{ name, symbol, decimals, … }` |
| `decodePayment` | Parse ICRC payment URIs / QR payloads |
| `IcrcTransferError` | Typed transfer errors |

### NFT variant

`IcrcNftLedgerCanister` — ICRC-7 style NFT ledgers (not used in ICPay today).

---

## 2. `ledger/icp` — legacy ICP ledger

**Use when:** account identifier (64-char hex), subaccount derivation, or official ICP index.

| Class | Key APIs |
|---|---|
| `IcpLedgerCanister` | `transfer`, `accountBalance`, ICRC-1/2 on ICP ledger |
| `IcpIndexCanister` | ICP transaction history by account identifier |
| `AccountIdentifier` / `SubAccount` | Build/hash legacy account IDs |

ICPay still uses this for **deposit account ID** display alongside ICRC-1 address.

---

## 3. `ledger/cycles` — cycles ledger

| Method | Purpose |
|---|---|
| Balance, transfer, deposit, withdraw | Move cycles as a ledger token |

**ICPay today:** operator top-up via `npm run ci cycles:topup` (CLI), not exposed in the wallet UI.

---

## 4. `ckbtc` — Bitcoin bridge

### `CkBtcMinterCanister`

| Method | Purpose |
|---|---|
| `getBtcAddress` | Native BTC deposit address for a principal/subaccount |
| `updateBalance` | Credit ckBTC after BTC lands on-chain |
| `estimateWithdrawalFee` | Minter + Bitcoin network fee estimate |
| `retrieveBtc` / `retrieveBtcWithApproval` | Burn ckBTC → send BTC |
| `retrieveBtcStatusV2ByAccount` | Track outgoing BTC withdrawals |
| `getWithdrawalAccount` | Account to fund before BTC withdrawal |

### `BitcoinCanister`

| Method | Purpose |
|---|---|
| `getBalanceQuery` | Pending BTC balance at an address (before mint) |

---

## 5. `cketh` — Ethereum bridge

### `CkEthMinterCanister`

| Method | Purpose |
|---|---|
| `getEthAddress` | Native ETH deposit address |
| `eip1559TransactionPrice` | Gas estimate for ckETH → ETH withdrawal |
| `retrieveEth` / status helpers | Burn ckETH → send ETH |

### `CkEthOrchestratorCanister`

Coordinates orchestration between minter and helper canisters (advanced ops).

---

## 6. `nns` — Network Nervous System

### `NnsGovernanceCanister`

| Area | Methods |
|---|---|
| **Read** | `listProposals`, `getProposal`, `listNeurons`, `listKnownNeurons`, `getLatestRewardEvent`, metrics |
| **Write** | `stakeNeuron`, `increaseDissolveDelay`, `follow`, `registerVote`, `makeProposal`, `disburseNeuron`, … |

Voting and neuron management require the **user's own principal** to sign — not a custodial subaccount.

### `SnsWasmCanister`

| Method | Purpose |
|---|---|
| `listSnses` | Registry of all SNS deployments (ledger, root, swap ids) |

### `NnsGenesisTokenCanister`

Early ICP genesis token claims (historical; not relevant to ICPay wallet flows).

---

## 7. `sns` — Service Nervous System (per token)

Use `initSnsWrapper({ agent, rootOptions })` to get a combined client.

| Surface | Methods |
|---|---|
| **Metadata** | `metadata` — name, description, logo URL |
| **Governance** | `listProposals`, `getProposal`, vote/follow/neuron APIs (same pattern as NNS) |
| **Swap** | `SnsSwapCanister` — participation in SNS launch swaps |
| **Root** | `SnsRootCanister` — canister lifecycle for one SNS |

---

## 8. `cmc` — Cycles Minting Canister

| Method | Purpose |
|---|---|
| `getIcpToCyclesConversionRate` | On-chain ICP/XDR rate → derive USD when paired with XDR/USD |

No 24h change or volume — that still needs an external feed (CoinGecko in ICPay).

---

## 9. `ic-management` — Management canister

| Method | Purpose |
|---|---|
| `canisterStatus` | Memory, cycles, module hash, controllers |
| `fetchCanisterLogs` | Debug logs (controller-only) |
| `createCanister`, `installCode`, `updateSettings` | Deploy/upgrade (controller-only) |
| Snapshot APIs | State snapshots for backup/restore |

ICPay uses **read-only** status/logs in ops tooling.

---

## 10. `assets` — Asset canister

| Feature | Purpose |
|---|---|
| `store` (file/blob/path) | Upload with progress, gzip/br encoding |
| `get`, `delete`, `list` | Asset CRUD |
| `configure` | Set asset canister properties |

Separate from ICPay Bucket (custom Motoko storage). Useful for frontend canister deploys.

---

## Query vs update

| Call type | Billed? | When to use |
|---|---|---|
| **Query** | No cycles to caller | Balances, metadata, read-only lists |
| **Update** | Yes | Transfers, `updateBalance`, index `getTransactions`, votes |

ICPay defaults to `certified: false` on queries for speed; use `certified: true` when you need subnet-verified state.

---

## ICPay files already using this package

| ICPay file | SDK import |
|---|---|
| `services/tokens.ts` | `IcrcLedgerCanister`, `SnsWasmCanister` |
| `services/ledger/icrc.ts` | `IcrcLedgerCanister` |
| `services/ledger/icrcHistory.ts` | `IcrcIndexCanister`, `IcrcLedgerCanister` |
| `services/account/account.ts` | `IcpLedgerCanister`, `IcpIndexCanister` |
| `services/chainkey/deposits.ts` | `CkBtcMinterCanister`, `CkEthMinterCanister` |
| `services/chainkey/status.ts` | `BitcoinCanister`, minters |
| `services/governance/governance.ts` | `NnsGovernanceCanister`, `SnsWasmCanister`, `initSnsWrapper` |
| `services/market/icpPrice.ts` | `CmcCanister` |
| `services/ops/canister.ts` | `IcManagementCanister` |
| `services/sweep/sweep.ts` | `IcrcTransferError` |
| `lib/wallet/paymentUri.ts` | `decodePayment` |

---

## Version bumps

When upgrading `@icp-sdk/canisters`:

1. Read the [changelog](https://github.com/dfinity/icp-js-canisters/releases).
2. Run `cd frontend && ./node_modules/.bin/tsc --noEmit && npm run build`.
3. Re-test chain-key deposit, governance list, and ICRC history — these hit the most API surface.
