use candid::{Nat, Principal};
use ic_cdk::call::Call;

use crate::icpswap::types::{DepositAndSwapArgs, PoolResult};

pub async fn deposit_from_and_swap(pool: Principal, args: DepositAndSwapArgs) -> Result<u64, String> {
    let (result,): (PoolResult<Nat>,) = Call::bounded_wait(pool, "depositFromAndSwap")
        .with_arg(args)
        .await
        .map_err(|e| format!("depositFromAndSwap failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("depositFromAndSwap decode failed: {e:?}"))?;

    match result {
        PoolResult::Ok(amount) => Ok(amount.0.try_into().unwrap_or(0)),
        PoolResult::Err(e) => Err(format!("depositFromAndSwap pool error: {e:?}")),
    }
}
