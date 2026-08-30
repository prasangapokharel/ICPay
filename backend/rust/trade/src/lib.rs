mod api;
mod config;
mod domain;
mod icpswap;
mod ledger;
mod storage;
mod types;
mod wallet;

#[cfg(test)]
#[path = "../test/integration/mod.rs"]
mod integration;

use candid::{Nat, Principal};
use ic_cdk::{init, post_upgrade};
use icrc_ledger_types::icrc1::account::Account;
use storage::{set_config, CanisterConfig};
use types::{ApiResult, InitArgs, SwapResult};

use crate::config::DEFAULT_SLIPPAGE_BPS;

#[init]
fn init(args: InitArgs) {
    set_config(CanisterConfig {
        wallet_canister: args.wallet_canister,
        treasury: args.treasury,
    });
}

#[post_upgrade]
fn post_upgrade(args: InitArgs) {
    set_config(CanisterConfig {
        wallet_canister: args.wallet_canister,
        treasury: args.treasury,
    });
}

#[ic_cdk::query]
fn health() -> String {
    format!(
        "ok; default_slippage_bps={DEFAULT_SLIPPAGE_BPS}; default_min_out_sample={}",
        crate::domain::fees::default_min_out(1_000_000)
    )
}

#[ic_cdk::query]
fn get_trading_balance(user: candid::Principal, token: String) -> Nat {
    Nat::from(storage::balances::get(user, &token))
}

ic_cdk::export_candid!();
