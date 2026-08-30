#[cfg(test)]
pub struct QuoteBreakdown {
    pub service_fee: u64,
    pub amount_after_fee: u64,
    pub swap_fee: u64,
    pub net_out: u64,
}

pub fn net_out(gross_out: u64, out_ledger_fee: u64) -> u64 {
    let out_fees = out_ledger_fee.saturating_mul(2);
    if gross_out > out_fees {
        gross_out - out_fees
    } else {
        0
    }
}

#[cfg(test)]
pub fn breakdown(amount_in: u64, gross_out: u64, pool_fee_tier: u32, out_ledger_fee: u64) -> QuoteBreakdown {
    use crate::domain::fees::{amount_after_service_fee, pool_fee_amount, service_fee};

    let fee = service_fee(amount_in);
    let after_fee = amount_after_service_fee(amount_in);
    let swap_fee = pool_fee_amount(after_fee, pool_fee_tier);

    QuoteBreakdown {
        service_fee: fee,
        amount_after_fee: after_fee,
        swap_fee,
        net_out: net_out(gross_out, out_ledger_fee),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn net_out_subtracts_double_ledger_fee() {
        let q = breakdown(100_000_000, 50_000, 3000, 10);
        assert_eq!(q.service_fee, 100_000);
        assert_eq!(q.amount_after_fee, 99_900_000);
        assert!(q.net_out < 50_000);
    }
}
