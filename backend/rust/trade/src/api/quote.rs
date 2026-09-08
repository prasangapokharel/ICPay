use candid::Nat;

use crate::config::DEFAULT_SLIPPAGE_BPS;
use crate::types::ApiResult;

/// M1: wire to factory + pool quote. Slippage default is exposed for clients until then.
#[ic_cdk::query]
fn get_swap_quote(token_in: String, token_out: String, amount_in: Nat) -> ApiResult<crate::types::SwapQuoteResult> {
    let _ = (token_in, token_out, amount_in);
    ApiResult::err(format!(
        "get_swap_quote: enable in M1 (default slippage {DEFAULT_SLIPPAGE_BPS} bps)"
    ))
}
