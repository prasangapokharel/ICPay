use candid::{Nat, Principal};
use ic_cdk::update;

use crate::domain::swap_exec::execute_swap_for;
use crate::types::ApiResult;
use crate::wallet::gate;

#[update]
async fn execute_swap(
    token_in: String,
    token_out: String,
    amount_in: Nat,
    amount_out_min: Nat,
) -> ApiResult<crate::types::SwapResult> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return ApiResult::err(e);
    }
    execute_swap_for(caller, token_in, token_out, amount_in, amount_out_min).await
}

/// Wallet-only: one ingress call from the user, swap runs inside wallet orchestration.
#[update]
async fn execute_swap_for_user(
    user: Principal,
    token_in: String,
    token_out: String,
    amount_in: Nat,
    amount_out_min: Nat,
) -> ApiResult<crate::types::SwapResult> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::assert_wallet_caller(caller) {
        return ApiResult::err(e);
    }
    if let Err(e) = gate::reject_anonymous(user) {
        return ApiResult::err(e);
    }
    execute_swap_for(user, token_in, token_out, amount_in, amount_out_min).await
}
