use candid::Principal;

use crate::storage::with_config;

pub fn assert_wallet_caller(caller: Principal) -> Result<(), String> {
    let wallet = with_config(|c| c.wallet_canister);
    if caller != wallet {
        return Err("caller is not wallet canister".into());
    }
    Ok(())
}

pub fn reject_anonymous(caller: Principal) -> Result<(), String> {
    if caller == Principal::anonymous() {
        return Err("not authenticated".into());
    }
    Ok(())
}
