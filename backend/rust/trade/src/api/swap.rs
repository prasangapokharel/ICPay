use candid::{Nat, Principal};
use ic_cdk::update;

use crate::domain::fees::{amount_after_service_fee, icrc2_allowance_amount, service_fee};
use crate::domain::quote::net_out;
use crate::icpswap::factory::resolve_pool;
use crate::icpswap::pool::deposit_from_and_swap;
use crate::icpswap::types::DepositAndSwapArgs;
use crate::ledger::icrc::{approve_spender, transfer_fee};
use crate::storage::balances;
use crate::types::{ApiResult, SwapResult};
use crate::wallet::gate;

#[update]
async fn execute_swap(
    token_in: String,
    token_out: String,
    amount_in: Nat,
    amount_out_min: Nat,
) -> ApiResult<SwapResult> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return ApiResult::err(e);
    }

    let amount_in_u64: u64 = match amount_in.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("amount_in too large"),
    };
    let min_out_u64: u64 = match amount_out_min.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("amount_out_min too large"),
    };

    if amount_in_u64 == 0 {
        return ApiResult::err("amount_in must be > 0");
    }
    if min_out_u64 == 0 {
        return ApiResult::err("amount_out_min must be > 0");
    }
    if token_in == token_out {
        return ApiResult::err("token_in and token_out must differ");
    }

    let svc = service_fee(amount_in_u64);
    if balances::get(caller, &token_in) < amount_in_u64 {
        return ApiResult::err("insufficient trading balance — deposit first");
    }

    let token_in_id = match Principal::from_text(&token_in) {
        Ok(p) => p,
        Err(e) => return ApiResult::err(format!("invalid token_in: {e}")),
    };
    let token_out_id = match Principal::from_text(&token_out) {
        Ok(p) => p,
        Err(e) => return ApiResult::err(format!("invalid token_out: {e}")),
    };

    let fee_in = match transfer_fee(token_in_id).await {
        Ok(f) => f,
        Err(e) => return ApiResult::err(e),
    };
    let fee_out = match transfer_fee(token_out_id).await {
        Ok(f) => f,
        Err(e) => return ApiResult::err(e),
    };

    let swap_amount = amount_after_service_fee(amount_in_u64).saturating_sub(fee_in);
    if swap_amount == 0 {
        return ApiResult::err("amount_in too small after service and ledger fees");
    }

    let pool = match resolve_pool(&token_in, &token_out).await {
        Ok(p) => p,
        Err(e) => return ApiResult::err(e),
    };

    if let Err(e) = balances::debit(caller, &token_in, amount_in_u64) {
        return ApiResult::err(e);
    }

    let allowance = icrc2_allowance_amount(swap_amount, fee_in);
    if let Err(e) = approve_spender(token_in_id, pool.pool_id, allowance, fee_in).await {
        balances::credit(caller, &token_in, amount_in_u64);
        return ApiResult::err(e);
    }

    let gross_out = match deposit_from_and_swap(
        pool.pool_id,
        DepositAndSwapArgs {
            token_in_fee: Nat::from(fee_in),
            amount_in: swap_amount.to_string(),
            zero_for_one: pool.zero_for_one,
            amount_out_minimum: min_out_u64.to_string(),
            token_out_fee: Nat::from(fee_out),
        },
    )
    .await
    {
        Ok(v) => v,
        Err(e) => {
            balances::credit(caller, &token_in, amount_in_u64);
            return ApiResult::err(e);
        }
    };

    if gross_out < min_out_u64 {
        balances::credit(caller, &token_in, amount_in_u64);
        return ApiResult::err(format!(
            "slippage exceeded: got {gross_out}, minimum {min_out_u64}"
        ));
    }

    let net_out = net_out(gross_out, fee_out);
    if net_out == 0 {
        balances::credit(caller, &token_in, amount_in_u64);
        return ApiResult::err("amount_out too small after ledger fees");
    }

    balances::credit(caller, &token_out, net_out);

    ApiResult::ok(SwapResult {
        block_index: 0,
        amount_in: Nat::from(amount_in_u64),
        amount_out: Nat::from(net_out),
        service_fee: Nat::from(svc),
        tx_id: format!("trade-{}", ic_cdk::api::time()),
    })
}
