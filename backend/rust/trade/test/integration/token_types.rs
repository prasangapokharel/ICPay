use crate::config::ICP_LEDGER;
use crate::icpswap::types::{pair_key, token_standard, PoolData, PoolResult};

#[test]
fn pool_data_decodes_official_icpswap_response() {
    const HEX: &str = "4449444c046b029cc20102e58eb402016b04fd84aff9047fab8e83800e71a4a4a1b50e71eb9cdbd50f7f6c06c6fcb6027d9f93c60271a6dbc5ee017c97ae9c8f090398ae9c8f0903e2f3fba60f686c02b4e3ade80971bdeee0d30e71010000b8173c72796a6c332d74796161612d61616161612d61616162612d6361695f73733266782d64796161612d61616161722d7161636f712d6361695f333030303c1b72796a6c332d74796161612d61616161612d61616162612d6361690549435243321b73733266782d64796161612d61616161722d7161636f712d636169054943524332010a0000000000d0155b0101";
    let bytes: Vec<u8> = (0..HEX.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&HEX[i..i + 2], 16).expect("hex"))
        .collect();
    let (result,): (PoolResult<PoolData>,) =
        candid::decode_args(&bytes).expect("decode PoolResult<PoolData>");
    match result {
        PoolResult::Ok(pool) => {
            assert_eq!(pool.key, "ryjl3-tyaaa-aaaaa-aaaba-cai_ss2fx-dyaaa-aaaar-qacoq-cai_3000");
            assert_eq!(pool.token0.address, "ryjl3-tyaaa-aaaaa-aaaba-cai");
            assert_eq!(
                pool.canister_id.to_text(),
                "angxa-baaaa-aaaag-qcvnq-cai"
            );
        }
        PoolResult::Err(_) => panic!("expected ok variant"),
    }
}

#[test]
fn token_standard_for_known_ledgers() {
    assert_eq!(token_standard(ICP_LEDGER), "ICP");
    assert_eq!(
        token_standard("mxzaz-hqaaa-aaaar-qaada-cai"),
        "ICRC2"
    );
    assert_eq!(
        token_standard("aaaaa-aa"),
        "ICRC1"
    );
}

#[test]
fn pair_key_is_order_independent() {
    let a = "aaaaa-aa";
    let b = "bbbbb-bb";
    assert_eq!(pair_key(a, b), pair_key(b, a));
    assert_eq!(pair_key(a, b), format!("{a}#{b}"));
}
