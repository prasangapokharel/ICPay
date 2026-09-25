use crate::config::{MAKER_FEE_BPS, MIN_SERVICE_FEE, TAKER_FEE_BPS};

/// Taker fee (0.15% = 15 bps) on amount_in (floor 1 base unit).
pub fn taker_fee(amount_in: u64) -> u64 {
    let raw = amount_in.saturating_mul(TAKER_FEE_BPS) / 10_000;
    raw.max(MIN_SERVICE_FEE)
}

/// Maker fee (0.05% = 5 bps) on amount_in (floor 1 base unit).
#[allow(dead_code)]
pub fn maker_fee(amount_in: u64) -> u64 {
    let raw = amount_in.saturating_mul(MAKER_FEE_BPS) / 10_000;
    raw.max(MIN_SERVICE_FEE)
}

/// Default service fee on amount_in (taker fee).
pub fn service_fee(amount_in: u64) -> u64 {
    taker_fee(amount_in)
}

pub fn amount_after_service_fee(amount_in: u64) -> u64 {
    amount_in.saturating_sub(service_fee(amount_in))
}

#[allow(dead_code)]
pub fn amount_after_maker_fee(amount_in: u64) -> u64 {
    amount_in.saturating_sub(maker_fee(amount_in))
}

/// ICRC-2 allowance ICPSwap needs before depositFromAndSwap (amount + ledger fee).
pub fn icrc2_allowance_amount(swap_amount: u64, token_in_fee: u64) -> u64 {
    swap_amount.saturating_add(token_in_fee)
}

/// Pool fee from ICPSwap tier (fee is per million, e.g. 3000 = 0.3%).
#[cfg(test)]
pub fn pool_fee_amount(amount_in: u64, fee_tier: u32) -> u64 {
    amount_in.saturating_mul(fee_tier as u64) / 1_000_000
}

pub fn min_amount_out(amount_out: u64, slippage_bps: u64) -> u64 {
    if amount_out == 0 {
        return 0;
    }
    amount_out.saturating_mul(10_000 - slippage_bps) / 10_000
}

pub fn default_min_out(amount_out: u64) -> u64 {
    min_amount_out(amount_out, crate::config::DEFAULT_SLIPPAGE_BPS)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn taker_and_maker_fee_rates() {
        assert_eq!(taker_fee(100_000_000), 150_000); // 0.15% of 1 ICP = 0.0015 ICP
        assert_eq!(maker_fee(100_000_000), 50_000);  // 0.05% of 1 ICP = 0.0005 ICP
        assert_eq!(taker_fee(1), 1);
        assert_eq!(maker_fee(1), 1);
    }

    #[test]
    fn amount_after_fee() {
        assert_eq!(amount_after_service_fee(100_000_000), 99_850_000);
        assert_eq!(amount_after_maker_fee(100_000_000), 99_950_000);
    }

    #[test]
    fn slippage_one_percent() {
        assert_eq!(min_amount_out(1_000_000, 100), 990_000);
    }

    #[test]
    fn icrc2_allowance_covers_swap_and_ledger_fee() {
        assert_eq!(icrc2_allowance_amount(99_850_000, 10_000), 99_860_000);
    }
}
