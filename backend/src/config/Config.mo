module {
  public let ICP_LEDGER_CANISTER_ID: Text = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  public let ICP_DECIMALS: Nat = 8;

  // Not SNS-launched, so SNS-W does not list them. Compiled in rather than
  // discovered, so a cold or unreachable SNS-W can never make ICP unspendable.
  // Mirrors CK_LEDGER_IDS in frontend/services/tokens.ts.
  public let CHAIN_KEY_LEDGERS: [Text] = [
    ICP_LEDGER_CANISTER_ID,
    "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
    "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
    "xevnm-gaaaa-aaaar-qafnq-cai", // ckUSDC
    "cngnf-vqaaa-aaaar-qag4q-cai", // ckUSDT
  ];

  // The NNS SNS-W canister, which knows every SNS ever deployed.
  public let SNS_WASM_CANISTER_ID: Text = "qaa6y-5yaaa-aaaaa-aaafa-cai";

  // Short handles are the scarce inventory, so 1-4 chars are sold rather than
  // given away. Handles already claimed under the old 32-char ceiling keep
  // resolving; this only gates new claims.
  public let MAX_USERNAME_LENGTH: Nat = 8;
  public let MIN_USERNAME_LENGTH: Nat = 1;
  public let FREE_MIN_USERNAME_LENGTH: Nat = 5;

  // Receives username purchases. A plain principal, not a custodial subaccount:
  // the proceeds have to be spendable by its owner without going through this
  // canister.
  public let USERNAME_TREASURY: Text = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe";

  public let PRICE_ULTRA_PREMIUM: Nat = 1_000_000_000; // 1-3 chars, 10 ICP
  public let PRICE_PREMIUM: Nat = 500_000_000; // 4 chars, 5 ICP
  public let PRICE_STANDARD: Nat = 200_000_000; // 5 chars, 2 ICP
  public let PRICE_BASIC: Nat = 100_000_000; // 6-8 chars, 1 ICP
  public let PAGE_SIZE: Nat = 20;
  // Every history read scans the whole transaction list, so an unbounded page
  // size lets one caller's request grow with total canister activity. 50 rows
  // is more history than the UI shows and keeps the per-call cost predictable.
  public let MAX_PAGE_SIZE: Nat = 50;
  // The ICP ledger rejects a memo blob over 32 bytes. Counted in UTF-8 bytes,
  // not characters, because one emoji costs four.
  public let MEMO_MAX_BYTES: Nat = 32;
};
