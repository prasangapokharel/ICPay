use candid::Principal;
use ic_cdk::call::Call;

use crate::config::{icpswap_factory, POOL_FEE_TIERS};
use crate::icpswap::types::{pair_key, GetPoolArgs, PoolData, PoolResult, Token, token_standard};
use crate::storage::pools::{self, CachedPool};

pub struct PoolRef {
    pub pool_id: Principal,
    pub zero_for_one: bool,
}

pub async fn resolve_pool(token_in: &str, token_out: &str) -> Result<PoolRef, String> {
    let key = pair_key(token_in, token_out);
    if let Some(cached) = pools::get(&key) {
        return Ok(PoolRef {
            pool_id: cached.pool_id,
            zero_for_one: token_in == cached.token0,
        });
    }

    let factory = icpswap_factory();
    let (t0, t1) = if token_in < token_out {
        (token_in, token_out)
    } else {
        (token_out, token_in)
    };

    let token0 = Token {
        address: t0.to_string(),
        standard: token_standard(t0).to_string(),
    };
    let token1 = Token {
        address: t1.to_string(),
        standard: token_standard(t1).to_string(),
    };

    for fee in POOL_FEE_TIERS {
        let args = GetPoolArgs {
            fee: candid::Nat::from(fee),
            token0: token0.clone(),
            token1: token1.clone(),
        };

        let (result,): (PoolResult<PoolData>,) = Call::bounded_wait(factory, "getPool")
            .with_arg(args)
            .await
            .map_err(|e| format!("getPool failed: {e:?}"))?
            .candid_tuple()
            .map_err(|e| format!("getPool decode failed: {e:?}"))?;

        if let PoolResult::Ok(pool) = result {
            let fee_u32: u32 = pool.fee.0.try_into().unwrap_or(fee);
            let token0_addr = pool.token0.address.clone();
            pools::put(
                key,
                CachedPool {
                    pool_id: pool.canister_id,
                    token0: token0_addr.clone(),
                    fee: fee_u32,
                },
            );
            return Ok(PoolRef {
                pool_id: pool.canister_id,
                zero_for_one: token_in == token0_addr,
            });
        }
    }

    Err(format!("no pool for {token_in} / {token_out}"))
}
