use candid::Principal;
use ic_stable_structures::storable::Storable;

use crate::storage::{set_config, with_config, CanisterConfig};

fn principal(byte: u8) -> Principal {
    Principal::from_slice(&[byte; 29])
}

#[test]
fn canister_config_round_trips_through_storable() {
    let cfg = CanisterConfig {
        wallet_canister: principal(20),
        treasury: principal(21),
    };

    let bytes = cfg.to_bytes();
    let decoded = CanisterConfig::from_bytes(bytes);
    assert_eq!(decoded.wallet_canister, cfg.wallet_canister);
    assert_eq!(decoded.treasury, cfg.treasury);
}

#[test]
fn set_and_read_config() {
    let wallet = principal(22);
    let treasury = principal(23);

    set_config(CanisterConfig {
        wallet_canister: wallet,
        treasury,
    });

    with_config(|c| {
        assert_eq!(c.wallet_canister, wallet);
        assert_eq!(c.treasury, treasury);
    });
}
