use candid::Principal;
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use super::{Memory, BALANCES_MEM_ID, MEMORY_MANAGER};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct BalanceKey {
    pub user: Principal,
    pub token: String,
}

impl Storable for BalanceKey {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode BalanceKey");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode BalanceKey");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode BalanceKey")
    }
}

thread_local! {
    static BALANCES: RefCell<StableBTreeMap<BalanceKey, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(BALANCES_MEM_ID)))
    );
}

pub fn get(user: Principal, token: &str) -> u64 {
    let key = BalanceKey {
        user,
        token: token.to_string(),
    };
    BALANCES.with(|m| m.borrow().get(&key).unwrap_or(0))
}

pub fn credit(user: Principal, token: &str, amount: u64) {
    let key = BalanceKey {
        user,
        token: token.to_string(),
    };
    BALANCES.with(|m| {
        let mut map = m.borrow_mut();
        let current = map.get(&key).unwrap_or(0);
        map.insert(key, current.saturating_add(amount));
    });
}

pub fn debit(user: Principal, token: &str, amount: u64) -> Result<(), String> {
    let key = BalanceKey {
        user,
        token: token.to_string(),
    };
    BALANCES.with(|m| {
        let mut map = m.borrow_mut();
        let current = map.get(&key).unwrap_or(0);
        if current < amount {
            return Err("insufficient trading balance".into());
        }
        map.insert(key, current - amount);
        Ok(())
    })
}
