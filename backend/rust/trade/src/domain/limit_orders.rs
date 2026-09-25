use candid::{Nat, Principal};
use std::cell::RefCell;

use crate::storage::{balances, limit_orders::{self, StoredLimitOrder}};
use crate::types::{ApiResult, LimitOrder, OrderStatus};

thread_local! {
    static ORDER_COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

fn next_order_id(time_ns: u64) -> u64 {
    let count = ORDER_COUNTER.with(|c| {
        let mut n = c.borrow_mut();
        *n = n.wrapping_add(1);
        *n
    });
    // Compose timestamp with counter for globally unique, monotonically increasing order IDs
    (time_ns & 0xFFFFFFFFFFFF0000) | (count & 0xFFFF)
}

pub fn place_limit_order(
    user: Principal,
    token_in: String,
    token_out: String,
    amount_in: Nat,
    min_amount_out: Nat,
) -> ApiResult<LimitOrder> {
    let amount_in_u64: u64 = match amount_in.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("amount_in too large"),
    };
    let min_out_u64: u64 = match min_amount_out.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("min_amount_out too large"),
    };

    if amount_in_u64 == 0 {
        return ApiResult::err("amount_in must be > 0");
    }
    if min_out_u64 == 0 {
        return ApiResult::err("min_amount_out must be > 0");
    }
    if token_in == token_out {
        return ApiResult::err("token_in and token_out must differ");
    }

    if balances::get(user, &token_in) < amount_in_u64 {
        return ApiResult::err("insufficient trading balance to place limit order");
    }

    // Debit funds into limit order escrow
    if let Err(e) = balances::debit(user, &token_in, amount_in_u64) {
        return ApiResult::err(e);
    }

    let time_ns = crate::config::current_time_ns();
    let order_id = next_order_id(time_ns);

    let stored = StoredLimitOrder {
        id: order_id,
        user,
        token_in,
        token_out,
        amount_in: amount_in_u64,
        min_amount_out: min_out_u64,
        created_at_ns: time_ns,
        filled_at_ns: None,
        status: OrderStatus::Open,
    };

    limit_orders::insert_order(stored.clone());
    ApiResult::ok(stored.to_limit_order())
}

pub fn cancel_limit_order(user: Principal, order_id: u64) -> ApiResult<Nat> {
    let order = match limit_orders::get_order(order_id) {
        Some(o) => o,
        None => return ApiResult::err("order not found"),
    };

    if order.user != user {
        return ApiResult::err("unauthorized: not the owner of this order");
    }

    if order.status != OrderStatus::Open {
        return ApiResult::err(format!("cannot cancel order in status {:?}", order.status));
    }

    if let Err(e) = limit_orders::update_order_status(order_id, OrderStatus::Cancelled, None) {
        return ApiResult::err(e);
    }

    // Refund escrowed funds back to user's trading balance
    balances::credit(user, &order.token_in, order.amount_in);
    ApiResult::ok(Nat::from(order.amount_in))
}
