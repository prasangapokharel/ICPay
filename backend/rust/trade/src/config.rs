use candid::Principal;

/// ICPSwap SwapFactory — mainnet.
pub const ICPSWAP_FACTORY: &str = "4mmnk-kiaaa-aaaag-qbllq-cai";

/// Official ICP ledger.
pub const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";

/// Display / default ICP ICRC-1 fee (e8s). Query `icrc1_fee` at runtime before writes.
pub const ICP_FEE_E8S: u64 = 10_000;

/// Taker service fee for instant market swaps: 0.15% (15 bps) of amount_in.
pub const TAKER_FEE_BPS: u64 = 15;

/// Maker service fee for limit orders: 0.05% (5 bps) of amount_in.
#[allow(dead_code)]
pub const MAKER_FEE_BPS: u64 = 5;

/// Default / market service fee (15 bps).
#[allow(dead_code)]
pub const SERVICE_FEE_BPS: u64 = TAKER_FEE_BPS;

/// Minimum service fee in token base units (1 e8s).
pub const MIN_SERVICE_FEE: u64 = 1;

/// ICPSwap pool fee tiers (per million).
pub const POOL_FEE_TIERS: [u32; 3] = [500, 3000, 10_000];

/// Default slippage for amount_out_min (1%).
pub const DEFAULT_SLIPPAGE_BPS: u64 = 100;

pub fn icpswap_factory() -> Principal {
    Principal::from_text(ICPSWAP_FACTORY).expect("invalid ICPSWAP_FACTORY")
}

#[inline]
pub fn current_time_ns() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        ic_cdk::api::time()
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(0)
    }
}

