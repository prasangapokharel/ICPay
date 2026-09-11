# Create canister — CMC flow

Official path (same family as top-up):

1. Ensure II principal has ICP (withdraw shortfall from ICPay wallet if needed).
2. Transfer ICP to CMC account:
   - owner = CMC `rkp4c-7iaaa-aaaaa-aaaca-cai`
   - subaccount = `SubAccount.fromPrincipal(controller)` (II principal)
   - memo = `0x41455243` (`CREA` little-endian)
3. Call `notify_create_canister`:
   - `controller` = caller (must match)
   - `block_index` = ledger block
   - optional `subnet_selection` / `settings`

Leftover ICP after creation fee becomes initial cycles on the new canister.

Refs:

- https://js.icp.build/canisters/latest/api/cmc/
- Forum: ICRC memo `CREA` / `TPUP` / `MINT`
