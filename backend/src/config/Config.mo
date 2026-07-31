module {
  public let ICP_LEDGER_CANISTER_ID: Text = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  public let ICP_DECIMALS: Nat = 8;
  public let ICP_FEE: Nat = 10_000;
  public let MAX_USERNAME_LENGTH: Nat = 32;
  public let MIN_USERNAME_LENGTH: Nat = 3;
  public let PAGE_SIZE: Nat = 20;
  // Every history read scans the whole transaction list, so an unbounded page
  // size lets one caller's request grow with total canister activity. 50 rows
  // is more history than the UI shows and keeps the per-call cost predictable.
  public let MAX_PAGE_SIZE: Nat = 50;
};
