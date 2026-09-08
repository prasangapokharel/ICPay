use crate::domain::fees::{default_min_out, pool_fee_amount, service_fee};
use crate::domain::quote::breakdown;

#[test]
fn full_quote_pipeline_matches_fee_rules() {
    let amount_in = 100_000_000_u64;
    let pool_tier = 3000_u32;
    let ledger_fee = 10_000_u64;

    let svc = service_fee(amount_in);
    let swap_fee = pool_fee_amount(amount_in - svc, pool_tier);
    let gross_out = 45_000_000_u64;

    let q = breakdown(amount_in, gross_out, pool_tier, ledger_fee);
    let min_out = default_min_out(q.net_out);

    assert_eq!(svc, 100_000);
    assert_eq!(q.service_fee, svc);
    assert_eq!(q.swap_fee, swap_fee);
    assert_eq!(q.net_out, gross_out - ledger_fee * 2);
    assert_eq!(min_out, q.net_out * 9900 / 10_000);
}
