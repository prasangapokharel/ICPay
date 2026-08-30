use candid::{Nat, Principal};
use ic_cdk::call::Call;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};

use crate::config::ICP_FEE_E8S;

/// Transfer from this canister's default subaccount.
pub async fn transfer(
    ledger: Principal,
    to: Account,
    amount: u64,
    fee: Option<u64>,
) -> Result<u64, String> {
    let transfer_arg = TransferArg {
        from_subaccount: None,
        to,
        amount: Nat::from(amount),
        fee: fee.map(Nat::from),
        memo: None,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let (result,): (Result<Nat, TransferError>,) = Call::bounded_wait(ledger, "icrc1_transfer")
        .with_arg(transfer_arg)
        .await
        .map_err(|e| format!("icrc1_transfer call failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("icrc1_transfer decode failed: {e:?}"))?;

    match result {
        Ok(block_index) => Ok(block_index.0.try_into().unwrap_or(0)),
        Err(TransferError::InsufficientFunds { balance }) => {
            Err(format!("insufficient funds: balance {balance}"))
        }
        Err(TransferError::BadFee { expected_fee }) => {
            Err(format!("bad fee: expected {expected_fee}"))
        }
        Err(e) => Err(format!("transfer error: {e:?}")),
    }
}

/// Query current ICRC-1 transfer fee (use before setting fee explicitly).
pub async fn transfer_fee(ledger: Principal) -> Result<u64, String> {
    let (fee,): (Nat,) = Call::bounded_wait(ledger, "icrc1_fee")
        .with_arg(())
        .await
        .map_err(|e| format!("icrc1_fee call failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("icrc1_fee decode failed: {e:?}"))?;

    Ok(fee.0.try_into().unwrap_or(ICP_FEE_E8S))
}

/// ICPSwap `depositFromAndSwap` pulls input tokens via ICRC-2 transfer_from.
pub async fn approve_spender(
    ledger: Principal,
    spender: Principal,
    amount: u64,
    fee: u64,
) -> Result<(), String> {
    let args = ApproveArgs {
        from_subaccount: None,
        spender: Account {
            owner: spender,
            subaccount: None,
        },
        amount: Nat::from(amount),
        expected_allowance: None,
        expires_at: None,
        fee: Some(Nat::from(fee)),
        memo: None,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let (result,): (Result<Nat, ApproveError>,) = Call::bounded_wait(ledger, "icrc2_approve")
        .with_arg(args)
        .await
        .map_err(|e| format!("icrc2_approve call failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("icrc2_approve decode failed: {e:?}"))?;

    match result {
        Ok(_) => Ok(()),
        Err(ApproveError::Duplicate { .. }) => Ok(()),
        Err(e) => Err(format!("icrc2_approve error: {e}")),
    }
}
