use candid::Principal;

use crate::storage::balances;

fn user(id: u8) -> Principal {
    Principal::from_slice(&[id; 29])
}

#[test]
fn credit_and_debit_trading_balance() {
    let u = user(1);
    let token = "ryjl3-tyaaa-aaaaa-aaaba-cai";

    assert_eq!(balances::get(u, token), 0);

    balances::credit(u, token, 1_000_000);
    assert_eq!(balances::get(u, token), 1_000_000);

    balances::debit(u, token, 400_000).expect("debit");
    assert_eq!(balances::get(u, token), 600_000);
}

#[test]
fn debit_fails_when_insufficient() {
    let u = user(2);
    let token = "mxzaz-hqaaa-aaaar-qaada-cai";

    balances::credit(u, token, 100);
    let err = balances::debit(u, token, 101).unwrap_err();
    assert_eq!(err, "insufficient trading balance");
    assert_eq!(balances::get(u, token), 100);
}

#[test]
fn balances_are_per_user_and_token() {
    let alice = user(3);
    let bob = user(4);
    let icp = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    let ckbtc = "mxzaz-hqaaa-aaaar-qaada-cai";

    balances::credit(alice, icp, 50);
    balances::credit(bob, ckbtc, 70);

    assert_eq!(balances::get(alice, icp), 50);
    assert_eq!(balances::get(alice, ckbtc), 0);
    assert_eq!(balances::get(bob, icp), 0);
    assert_eq!(balances::get(bob, ckbtc), 70);
}
