use candid::Principal;
use ic_cdk::query;

use crate::storage::trades;
use crate::types::TradeRecord;

#[query]
fn get_user_trades(user: Principal, limit: Option<u64>) -> Vec<TradeRecord> {
    let lim = limit.unwrap_or(50).min(100) as usize;
    trades::get_user_trades(user, lim)
}
