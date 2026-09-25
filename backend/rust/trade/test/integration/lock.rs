use candid::Principal;
use crate::wallet::lock::UserTradeLock;

#[test]
fn lock_prevents_concurrent_swaps_for_same_user() {
    let user = Principal::from_slice(&[42; 29]);
    let guard1 = UserTradeLock::try_acquire(user);
    assert!(guard1.is_ok());

    let guard2 = UserTradeLock::try_acquire(user);
    assert!(guard2.is_err(), "second concurrent lock for same user must fail");

    let other_user = Principal::from_slice(&[43; 29]);
    let other_guard = UserTradeLock::try_acquire(other_user);
    assert!(other_guard.is_ok(), "different user lock must succeed");

    drop(guard1);
    let guard3 = UserTradeLock::try_acquire(user);
    assert!(guard3.is_ok(), "lock re-acquired after drop");
}
