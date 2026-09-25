use candid::{CandidType, Deserialize, Nat, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ApiResult<T> {
    Ok(T),
    Err(String),
}

impl<T> ApiResult<T> {
    pub fn ok(value: T) -> Self {
        ApiResult::Ok(value)
    }

    pub fn err(msg: impl Into<String>) -> Self {
        ApiResult::Err(msg.into())
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SwapQuoteResult {
    pub amount_out: Nat,
    pub amount_out_raw: Nat,
    pub service_fee: Nat,
    pub amount_after_fee: Nat,
    pub swap_fee: Nat,
    pub price_impact: String,
    pub pool_id: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SwapResult {
    pub block_index: u64,
    pub amount_in: Nat,
    pub amount_out: Nat,
    pub service_fee: Nat,
    pub tx_id: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TradeRecord {
    pub timestamp_ns: u64,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: Nat,
    pub amount_out: Nat,
    pub service_fee: Nat,
    pub tx_id: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum OrderStatus {
    Open,
    Filled,
    Cancelled,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LimitOrder {
    pub id: u64,
    pub user: Principal,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: Nat,
    pub min_amount_out: Nat,
    pub created_at_ns: u64,
    pub filled_at_ns: Option<u64>,
    pub status: OrderStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitArgs {
    pub wallet_canister: Principal,
    pub treasury: Principal,
}


