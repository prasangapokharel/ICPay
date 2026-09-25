use candid::{Nat, Principal};
use ic_cdk::{query, update};
use icrc_ledger_types::icrc1::account::Account;

use crate::storage::with_config;
use crate::types::ApiResult;

#[query]
fn get_treasury() -> Principal {
    with_config(|c| c.treasury)
}

#[update]
async fn sweep_fees(token: String) -> ApiResult<Nat> {
    let caller = ic_cdk::api::msg_caller();
    let treasury = with_config(|c| c.treasury);
    let wallet = with_config(|c| c.wallet_canister);

    if caller != treasury && caller != wallet && !ic_cdk::api::is_controller(&caller) {
        return ApiResult::err("unauthorized: caller is not treasury or controller");
    }

    let ledger = match Principal::from_text(&token) {
        Ok(p) => p,
        Err(e) => return ApiResult::err(format!("invalid token: {e}")),
    };

    let fee = match crate::ledger::icrc::transfer_fee(ledger).await {
        Ok(f) => f,
        Err(e) => return ApiResult::err(e),
    };

    let (balance,): (Nat,) = match ic_cdk::call::Call::bounded_wait(ledger, "icrc1_balance_of")
        .with_arg(Account {
            owner: ic_cdk::api::canister_self(),
            subaccount: None,
        })
        .await
    {
        Ok(res) => match res.candid_tuple() {
            Ok(tuple) => tuple,
            Err(e) => return ApiResult::err(format!("balance decode error: {e:?}")),
        },
        Err(e) => return ApiResult::err(format!("balance query error: {e:?}")),
    };

    let balance_u64: u64 = balance.0.try_into().unwrap_or(0);
    if balance_u64 <= fee {
        return ApiResult::err("accumulated balance too low to sweep after ledger fee");
    }

    let sweep_amount = balance_u64 - fee;
    let to = Account {
        owner: treasury,
        subaccount: None,
    };

    match crate::ledger::icrc::transfer(ledger, to, sweep_amount, Some(fee)).await {
        Ok(_) => ApiResult::ok(Nat::from(sweep_amount)),
        Err(e) => ApiResult::err(e),
    }
}
