module {
  public type Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type TransferArgs = {
    from_subaccount: ?Blob;
    to: Account;
    amount: Nat;
    fee: ?Nat;
    memo: ?Blob;
    created_at_time: ?Nat64;
  };

  public type TransferError = {
    #BadFee: { expected_fee: Nat };
    #BadBurn: { min_burn_amount: Nat };
    #InsufficientFunds: { balance: Nat };
    #TooOld;
    #CreatedInFuture: { ledger_time: Nat64 };
    #Duplicate: { duplicate_of: Nat };
    #TemporarilyUnavailable;
    #GenericError: { error_code: Nat; message: Text };
  };

  public type TransferResult = {
    #Ok: Nat;
    #Err: TransferError;
  };

  public type Value = {
    #Nat: Nat;
    #Int: Int;
    #Text: Text;
    #Blob: Blob;
    #Array: [Value];
    #Map: [(Text, Value)];
  };

  public type OldTokens = { e8s: Nat64 };

  public type OldTimeStamp = { timestamp_nanos: Nat64 };

  public type OldTransferArgs = {
    to: Blob;
    fee: OldTokens;
    memo: Nat64;
    from_subaccount: ?Blob;
    created_at_time: ?OldTimeStamp;
    amount: OldTokens;
  };

  public type OldTransferError = {
    #TxTooOld: { allowed_window_nanos: Nat64 };
    #BadFee: { expected_fee: OldTokens };
    #TxDuplicate: { duplicate_of: Nat64 };
    #TxCreatedInFuture;
    #InsufficientFunds: { balance: OldTokens };
  };

  public type OldTransferResult = {
    #Ok: Nat64;
    #Err: OldTransferError;
  };
};
