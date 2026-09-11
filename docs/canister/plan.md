# Canister module (frontend-only)

Local plan — gitignored under `docs/*`. No Motoko / backend changes.

## Goal

Public canister tools so builders create and fuel canisters without dfx/NNS.
Pay from ICPay wallet when needed; CMC + ICP ledger are official endpoints.

## Routes

| URL | Role |
|---|---|
| `/canister` | Hub |
| `/canister/create` | Create via CMC |
| `/topup` | Existing top-up (linked from hub) |

Shell: `PublicLayout` wide (shared nav/footer).

## Phase 1 (this start)

- Create canister: wallet shortfall → II → CMC `notify_create_canister`
- Hub cards: Create + Top up
- Subnet default or pick from `get_default_subnets`
- Controller = II caller; optional extra controllers in settings

## Phase 2+

- Canister status (controller-only)
- Start / stop / settings / logs / snapshots

## Backend cycles

| Leg | Costs ICPay canister |
|---|---|
| Wallet withdraw | Yes |
| II → ledger → CMC | No |
| Queries | No |
