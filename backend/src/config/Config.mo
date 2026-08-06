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

  // Receives username purchases and token launch revenue. A plain principal,
  // not a custodial subaccount: the proceeds have to be spendable by its owner
  // without going through this canister.
  public let TREASURY: Text = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe";

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

  // The NNS Cycles Minting Canister. It is the only way ICP becomes cycles, and
  // it creates the token canister itself so the child is funded out of the
  // user's fee rather than this canister's balance.
  public let CMC_CANISTER_ID: Text = "rkp4c-7iaaa-aaaaa-aaaca-cai";
  public let MANAGEMENT_CANISTER_ID: Text = "aaaaa-aa";

  // A launch costs 5 ICP, of which 2 buys the child's cycles and the rest is
  // revenue. Split here rather than at the call site so the two can never drift
  // apart into a launch that mints more cycles than it charged for.
  public let LAUNCH_FEE: Nat = 500_000_000; // 5 ICP
  public let LAUNCH_CYCLE_ALLOCATION: Nat = 200_000_000; // 2 ICP of the above

  // A year of idle burn, reserved rather than spent. It buys the creator time to
  // notice a dying token: frozen still answers queries, and any holder can
  // top it up because notify_top_up needs no controller rights.
  public let TOKEN_FREEZING_THRESHOLD: Nat = 31_536_000; // 365 days, seconds

  // Refuse to launch below this. A launch costs us four update calls, but the
  // real risk is accepting payment and then trapping mid-sequence because the
  // canister froze partway through.
  public let MIN_CYCLE_RESERVE: Nat = 5_000_000_000_000; // 5T

  // Canister-owned account that collects launch fees. Fixed, so it matches no
  // user's derived subaccount and deposits into it write no phantom history row.
  public let REVENUE_SUBACCOUNT: Blob = "\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";

  public let MAX_TOKEN_NAME_LENGTH: Nat = 32;
  public let MIN_TOKEN_NAME_LENGTH: Nat = 1;
  public let MAX_TOKEN_SYMBOL_LENGTH: Nat = 8;
  public let MIN_TOKEN_SYMBOL_LENGTH: Nat = 2;
  public let MAX_TOKEN_DESCRIPTION_LENGTH: Nat = 500;
  public let MAX_TOKEN_LINK_LENGTH: Nat = 256;
  // ICRC-1 permits up to 255, but a logo is stored inline in the token record
  // and served to every holder, so it is capped well below what fits.
  public let MAX_TOKEN_LOGO_BYTES: Nat = 32_000;
  public let MAX_TOKEN_DECIMALS: Nat8 = 18;
};
