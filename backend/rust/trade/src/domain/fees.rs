use crate::config::{MIN_SERVICE_FEE, SERVICE_FEE_BPS};

/// 0.1% service fee on amount_in (floor 1 base unit).
pub fn service_fee(amount_in: u64) -> u64 {
    let raw = amount_in.saturating_mul(SERVICE_FEE_BPS) / 10_000;
    raw.max(MIN_SERVICE_FEE)
}

pub fn amount_after_service_fee(amount_in: u64) -> u64 {
    amount_in.saturating_sub(service_fee(amount_in))
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
    fn service_fee_one_percent_of_bps() {
        assert_eq!(service_fee(100_000_000), 100_000);
        assert_eq!(service_fee(1), 1);
    }

    #[test]
    fn amount_after_fee() {
        assert_eq!(amount_after_service_fee(100_000_000), 99_900_000);
    }

    #[test]
    fn slippage_one_percent() {
        assert_eq!(min_amount_out(1_000_000, 100), 990_000);
    }

    #[test]
    fn icrc2_allowance_covers_swap_and_ledger_fee() {
        assert_eq!(icrc2_allowance_amount(99_900_000, 10_000), 99_910_000);
    }
}
