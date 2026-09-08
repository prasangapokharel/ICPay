use candid::{Nat, Principal};
use ic_cdk::update;
use icrc_ledger_types::icrc1::account::Account;

use crate::storage::balances;
use crate::wallet::gate;

#[update]
fn credit_from_wallet(
    user: Principal,
    token: String,
    amount: Nat,
    block_index: u64,
) -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    gate::assert_wallet_caller(caller)?;

    let amount_u64: u64 = amount
        .0
        .try_into()
        .map_err(|_| "amount too large".to_string())?;

    if amount_u64 == 0 {
        return Err("amount must be > 0".into());
    }

    let _ = block_index;
    balances::credit(user, &token, amount_u64);
    Ok(())
}

#[update]
async fn debit_to_wallet(
    user: Principal,
    token: String,
    amount: Nat,
    to: Account,
) -> Result<Nat, String> {
    let caller = ic_cdk::api::msg_caller();
    gate::assert_wallet_caller(caller)?;

    let _ = user;
    let amount_u64: u64 = amount
        .0
        .try_into()
        .map_err(|_| "amount too large".to_string())?;

    balances::debit(user, &token, amount_u64)?;

    let ledger = Principal::from_text(&token).map_err(|e| e.to_string())?;
    let fee = crate::ledger::icrc::transfer_fee(ledger).await?;
    let block = crate::ledger::icrc::transfer(ledger, to, amount_u64, Some(fee)).await?;

    Ok(Nat::from(block))
}
