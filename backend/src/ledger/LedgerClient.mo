import Types "Types";

module {
  public type ICRC1Service = actor {
    icrc1_balance_of: shared query Types.Account -> async Nat;
    icrc1_transfer: shared Types.TransferArgs -> async Types.TransferResult;
    icrc1_fee: shared query () -> async Nat;
    icrc1_decimals: shared query () -> async Nat8;
    icrc1_symbol: shared query () -> async Text;
    icrc1_name: shared query () -> async Text;
    icrc1_total_supply: shared query () -> async Nat;
    icrc1_supported_standards: shared query () -> async [{ name: Text; url: Text }];
    icrc1_minting_account: shared query () -> async ?Types.Account;
    transfer: shared Types.OldTransferArgs -> async Types.OldTransferResult;
  };
};
