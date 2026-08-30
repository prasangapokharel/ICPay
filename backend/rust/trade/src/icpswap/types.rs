use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Token {
    pub address: String,
    pub standard: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GetPoolArgs {
    pub fee: candid::Nat,
    pub token0: Token,
    pub token1: Token,
}

/// Official ICPSwap SwapFactory PoolData (camelCase on wire).
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PoolData {
    #[serde(rename = "canisterId")]
    pub canister_id: Principal,
    pub fee: candid::Nat,
    pub key: String,
    #[serde(rename = "tickSpacing")]
    pub tick_spacing: candid::Int,
    pub token0: Token,
    pub token1: Token,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum PoolError {
    CommonError,
    InternalError(String),
    UnsupportedToken(String),
    InsufficientFunds,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum PoolResult<T> {
    #[serde(rename = "ok")]
    Ok(T),
    #[serde(rename = "err")]
    Err(PoolError),
}

/// Official ICPSwap SwapPool depositFromAndSwap args (camelCase on wire).
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DepositAndSwapArgs {
    #[serde(rename = "tokenInFee")]
    pub token_in_fee: candid::Nat,
    #[serde(rename = "amountIn")]
    pub amount_in: String,
    #[serde(rename = "zeroForOne")]
    pub zero_for_one: bool,
    #[serde(rename = "amountOutMinimum")]
    pub amount_out_minimum: String,
    #[serde(rename = "tokenOutFee")]
    pub token_out_fee: candid::Nat,
}

pub fn token_standard(ledger_id: &str) -> &'static str {
    if ledger_id == crate::config::ICP_LEDGER {
        "ICP"
    } else if is_chain_key(ledger_id) {
        "ICRC2"
    } else {
        "ICRC1"
    }
}

fn is_chain_key(ledger_id: &str) -> bool {
    matches!(
        ledger_id,
        "mxzaz-hqaaa-aaaar-qaada-cai"
            | "ss2fx-dyaaa-aaaar-qacoq-cai"
            | "xnkie-eqaaa-aaaar-qafca-cai"
            | "cngnf-vqaaa-aaaar-qag4q-cai"
    )
}

pub fn pair_key(a: &str, b: &str) -> String {
    if a < b {
        format!("{a}#{b}")
    } else {
        format!("{b}#{a}")
    }
}
