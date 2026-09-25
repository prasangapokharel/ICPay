use candid::{Nat, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::types::TradeRecord;
use super::{Memory, MEMORY_MANAGER, TRADES_MEM_ID};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct TradeKey {
    pub user: Principal,
    /// Inverted timestamp (u64::MAX - timestamp_ns) so newer trades sort first in prefix scans
    pub rev_time_ns: u64,
    pub seq: u32,
}

impl Storable for TradeKey {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode TradeKey");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode TradeKey");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode TradeKey")
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StoredTrade {
    pub timestamp_ns: u64,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: u64,
    pub amount_out: u64,
    pub service_fee: u64,
    pub tx_id: String,
}

impl Storable for StoredTrade {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode StoredTrade");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode StoredTrade");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode StoredTrade")
    }
}

thread_local! {
    static TRADES: RefCell<StableBTreeMap<TradeKey, StoredTrade, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TRADES_MEM_ID)))
    );
    static SEQ: RefCell<u32> = const { RefCell::new(0) };
}

pub fn record_trade(user: Principal, trade: StoredTrade) {
    let seq = SEQ.with(|s| {
        let mut count = s.borrow_mut();
        *count = count.wrapping_add(1);
        *count
    });

    let key = TradeKey {
        user,
        rev_time_ns: u64::MAX - trade.timestamp_ns,
        seq,
    };

    TRADES.with(|m| {
        m.borrow_mut().insert(key, trade);
    });
}

pub fn get_user_trades(user: Principal, limit: usize) -> Vec<TradeRecord> {
    let start_key = TradeKey {
        user,
        rev_time_ns: 0,
        seq: 0,
    };

    TRADES.with(|m| {
        let map = m.borrow();
        map.range(start_key..)
            .take_while(|entry| entry.key().user == user)
            .take(limit)
            .map(|entry| {
                let item = entry.value();
                TradeRecord {
                    timestamp_ns: item.timestamp_ns,
                    token_in: item.token_in.clone(),
                    token_out: item.token_out.clone(),
                    amount_in: Nat::from(item.amount_in),
                    amount_out: Nat::from(item.amount_out),
                    service_fee: Nat::from(item.service_fee),
                    tx_id: item.tx_id.clone(),
                }
            })
            .collect()
    })
}

