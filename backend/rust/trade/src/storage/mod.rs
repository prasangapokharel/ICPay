use candid::{CandidType, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::{Bound, Storable},
    DefaultMemoryImpl, StableCell,
};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

pub mod balances;
pub mod pools;

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const CONFIG_MEM_ID: MemoryId = MemoryId::new(0);
pub const POOLS_MEM_ID: MemoryId = MemoryId::new(1);
pub const BALANCES_MEM_ID: MemoryId = MemoryId::new(2);

#[derive(CandidType, SerdeDeserialize, Serialize, Clone, Debug)]
pub struct CanisterConfig {
    pub wallet_canister: Principal,
    pub treasury: Principal,
}

impl Default for CanisterConfig {
    fn default() -> Self {
        Self {
            wallet_canister: Principal::anonymous(),
            treasury: Principal::anonymous(),
        }
    }
}

impl Storable for CanisterConfig {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode CanisterConfig");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode CanisterConfig");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode CanisterConfig")
    }
}

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static CONFIG: RefCell<StableCell<CanisterConfig, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CONFIG_MEM_ID)),
            CanisterConfig::default(),
        ),
    );
}

pub fn with_config<R>(f: impl FnOnce(&CanisterConfig) -> R) -> R {
    CONFIG.with(|c| f(c.borrow().get()))
}

pub fn set_config(cfg: CanisterConfig) {
    CONFIG.with(|c| {
        c.borrow_mut().set(cfg);
    });
}
