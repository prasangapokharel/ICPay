use candid::Principal;
use crate::storage::trades::{get_user_trades, record_trade, StoredTrade};

#[test]
fn records_and_retrieves_user_trades_chronologically() {
    let user = Principal::from_slice(&[77; 29]);

    record_trade(
        user,
        StoredTrade {
            timestamp_ns: 1_000_000,
            token_in: "tokenA".into(),
            token_out: "tokenB".into(),
            amount_in: 100,
            amount_out: 200,
            service_fee: 1,
            tx_id: "tx-1".into(),
        },
    );

    record_trade(
        user,
        StoredTrade {
            timestamp_ns: 2_000_000,
            token_in: "tokenA".into(),
            token_out: "tokenB".into(),
            amount_in: 300,
            amount_out: 600,
            service_fee: 3,
            tx_id: "tx-2".into(),
        },
    );

    let trades = get_user_trades(user, 10);
    assert_eq!(trades.len(), 2);
    assert_eq!(trades[0].tx_id, "tx-2");
    assert_eq!(trades[1].tx_id, "tx-1");
}
