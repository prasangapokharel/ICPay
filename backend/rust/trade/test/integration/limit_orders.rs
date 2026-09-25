use candid::{Nat, Principal};
use crate::domain::limit_orders::{cancel_limit_order, place_limit_order};
use crate::storage::{balances, limit_orders::get_open_orders};
use crate::types::{ApiResult, OrderStatus};

#[test]
fn place_and_cancel_limit_order_lifecycle() {
    let user = Principal::from_slice(&[88; 29]);
    let token_in = "tokenA";
    let token_out = "tokenB";

    // 1. Credit trading balance
    balances::credit(user, token_in, 1_000);
    assert_eq!(balances::get(user, token_in), 1_000);

    // 2. Reject placing order exceeding balance
    let fail_res = place_limit_order(user, token_in.into(), token_out.into(), Nat::from(1_500u64), Nat::from(2_000u64));
    assert!(matches!(fail_res, ApiResult::Err(_)), "cannot exceed balance");

    // 3. Place valid limit order
    let place_res = place_limit_order(user, token_in.into(), token_out.into(), Nat::from(400u64), Nat::from(800u64));
    let order = match place_res {
        ApiResult::Ok(o) => o,
        ApiResult::Err(e) => panic!("place order failed: {e}"),
    };

    assert_eq!(order.user, user);
    assert_eq!(order.amount_in, Nat::from(400u64));
    assert_eq!(order.min_amount_out, Nat::from(800u64));
    assert_eq!(order.status, OrderStatus::Open);

    // Balance should be debited from 1000 down to 600
    assert_eq!(balances::get(user, token_in), 600);

    // 4. Verify in open orders list
    let open_orders = get_open_orders(Some(user));
    assert_eq!(open_orders.len(), 1);
    assert_eq!(open_orders[0].id, order.id);

    // 5. Unauthorized cancel rejected
    let other_user = Principal::from_slice(&[89; 29]);
    let unauth_cancel = cancel_limit_order(other_user, order.id);
    assert!(matches!(unauth_cancel, ApiResult::Err(_)), "other user cannot cancel");

    // 6. Valid cancel refunds balance
    let cancel_res = cancel_limit_order(user, order.id);
    assert!(matches!(cancel_res, ApiResult::Ok(_)), "cancel succeeds");

    // Balance should be fully refunded to 1000
    assert_eq!(balances::get(user, token_in), 1_000);

    // Open orders count should now be 0
    let open_after_cancel = get_open_orders(Some(user));
    assert_eq!(open_after_cancel.len(), 0);

    // 7. Cannot double cancel
    let double_cancel = cancel_limit_order(user, order.id);
    assert!(matches!(double_cancel, ApiResult::Err(_)), "cannot double cancel");
}
