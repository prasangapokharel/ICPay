use candid::Principal;
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use super::{Memory, MEMORY_MANAGER, POOLS_MEM_ID};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CachedPool {
    pub pool_id: Principal,
    pub token0: String,
    pub fee: u32,
}

impl Storable for CachedPool {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode CachedPool");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode CachedPool");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode CachedPool")
    }
}

thread_local! {
    static POOL_CACHE: RefCell<StableBTreeMap<String, CachedPool, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(POOLS_MEM_ID)))
    );
}

pub fn get(pair_key: &str) -> Option<CachedPool> {
    POOL_CACHE.with(|m| m.borrow().get(&pair_key.to_string()))
}

pub fn put(pair_key: String, pool: CachedPool) {
    POOL_CACHE.with(|m| {
        m.borrow_mut().insert(pair_key, pool);
    });
}
