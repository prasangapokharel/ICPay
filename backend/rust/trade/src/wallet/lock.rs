use candid::Principal;
use std::cell::RefCell;
use std::collections::HashSet;

thread_local! {
    static ACTIVE_TRADES: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
}

/// RAII lock guard to ensure a user cannot submit multiple overlapping concurrent swaps.
pub struct UserTradeLock {
    user: Principal,
}

impl UserTradeLock {
    pub fn try_acquire(user: Principal) -> Result<Self, String> {
        ACTIVE_TRADES.with(|locks| {
            let mut set = locks.borrow_mut();
            if set.contains(&user) {
                return Err("a trade is already in progress for this account".into());
            }
            set.insert(user);
            Ok(Self { user })
        })
    }
}

impl Drop for UserTradeLock {
    fn drop(&mut self) {
        ACTIVE_TRADES.with(|locks| {
            locks.borrow_mut().remove(&self.user);
        });
    }
}
