use candid::Principal;

use crate::storage::{set_config, CanisterConfig};
use crate::wallet::gate;

fn principal(byte: u8) -> Principal {
    Principal::from_slice(&[byte; 29])
}

#[test]
fn wallet_gate_accepts_configured_caller() {
    let wallet = principal(10);
    set_config(CanisterConfig {
        wallet_canister: wallet,
        treasury: principal(11),
    });

    assert!(gate::assert_wallet_caller(wallet).is_ok());
}

#[test]
fn wallet_gate_rejects_other_callers() {
    let wallet = principal(12);
    set_config(CanisterConfig {
        wallet_canister: wallet,
        treasury: principal(13),
    });

    let err = gate::assert_wallet_caller(principal(99)).unwrap_err();
    assert_eq!(err, "caller is not wallet canister");
}

#[test]
fn anonymous_caller_is_rejected() {
    let err = gate::reject_anonymous(Principal::anonymous()).unwrap_err();
    assert_eq!(err, "not authenticated");
}
