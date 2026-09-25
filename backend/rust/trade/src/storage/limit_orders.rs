use candid::{Nat, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::{LimitOrder, OrderStatus};
use super::{Memory, LIMIT_ORDERS_MEM_ID, MEMORY_MANAGER};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StoredLimitOrder {
    pub id: u64,
    pub user: Principal,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: u64,
    pub min_amount_out: u64,
    pub created_at_ns: u64,
    pub filled_at_ns: Option<u64>,
    pub status: OrderStatus,
}

impl StoredLimitOrder {
    pub fn to_limit_order(&self) -> LimitOrder {
        LimitOrder {
            id: self.id,
            user: self.user,
            token_in: self.token_in.clone(),
            token_out: self.token_out.clone(),
            amount_in: Nat::from(self.amount_in),
            min_amount_out: Nat::from(self.min_amount_out),
            created_at_ns: self.created_at_ns,
            filled_at_ns: self.filled_at_ns,
            status: self.status.clone(),
        }
    }
}

impl Storable for StoredLimitOrder {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode StoredLimitOrder");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode StoredLimitOrder");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode StoredLimitOrder")
    }
}

thread_local! {
    static ORDERS: RefCell<StableBTreeMap<u64, StoredLimitOrder, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(LIMIT_ORDERS_MEM_ID)))
    );
}

pub fn insert_order(order: StoredLimitOrder) {
    ORDERS.with(|m| {
        m.borrow_mut().insert(order.id, order);
    });
}

pub fn get_order(id: u64) -> Option<StoredLimitOrder> {
    ORDERS.with(|m| m.borrow().get(&id))
}

pub fn update_order_status(id: u64, status: OrderStatus, filled_at: Option<u64>) -> Result<(), String> {
    ORDERS.with(|m| {
        let mut map = m.borrow_mut();
        let mut order = map.get(&id).ok_or_else(|| "order not found".to_string())?;
        order.status = status;
        if filled_at.is_some() {
            order.filled_at_ns = filled_at;
        }
        map.insert(id, order);
        Ok(())
    })
}

pub fn get_open_orders(user_filter: Option<Principal>) -> Vec<LimitOrder> {
    ORDERS.with(|m| {
        let map = m.borrow();
        map.iter()
            .map(|entry| entry.value().clone())
            .filter(|o| o.status == OrderStatus::Open && user_filter.map_or(true, |u| o.user == u))
            .map(|o| o.to_limit_order())
            .collect()
    })
}

pub fn get_user_orders(user: Principal, limit: usize) -> Vec<LimitOrder> {
    ORDERS.with(|m| {
        let map = m.borrow();
        map.iter()
            .map(|entry| entry.value().clone())
            .filter(|o| o.user == user)
            .take(limit)
            .map(|o| o.to_limit_order())
            .collect()
    })
}

#[allow(dead_code)]
pub fn open_orders_count() -> usize {
    ORDERS.with(|m| {
        let map = m.borrow();
        map.iter().filter(|entry| entry.value().status == OrderStatus::Open).count()
    })
}
