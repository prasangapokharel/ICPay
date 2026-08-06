import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  public type UserId = Text;
  public type Username = Text;
  public type TxId = Text;
  public type TokenId = Text;

  public type User = {
    id: UserId;
    principal: Principal;
    var username: ?Username;
    var displayName: Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type UserPublic = {
    id: UserId;
    username: ?Username;
    displayName: Text;
    createdAt: Int;
  };

  public type TxType = {
    #deposit;
    #withdraw;
    #transfer;
    #fee;
  };

  public type TxStatus = {
    #pending;
    #completed;
    #failed;
    #cancelled;
  };

  public type Transaction = {
    id: TxId;
    userId: UserId;
    txType: TxType;
    // Which ledger settled this. Without it every row renders as ICP and a
    // 0.5 ckBTC send is indistinguishable from a 0.5 ICP one.
    ledgerId: Text;
    amount: Nat;
    fee: Nat;
    from: Text;
    to: Text;
    var status: TxStatus;
    var blockIndex: ?Nat64;
    memo: ?Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type TransactionPublic = {
    id: TxId;
    userId: UserId;
    txType: TxType;
    ledgerId: Text;
    amount: Nat;
    fee: Nat;
    from: Text;
    to: Text;
    status: TxStatus;
    blockIndex: ?Nat64;
    memo: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  public type Settings = {
    userId: UserId;
    var theme: Text;
    var language: Text;
    var notifications: Bool;
    var updatedAt: Int;
  };

  public type SettingsPublic = {
    theme: Text;
    language: Text;
    notifications: Bool;
  };

  public type Deposit = {
    id: TxId;
    userId: UserId;
    amount: Nat;
    subaccount: Blob;
    blockIndex: Nat64;
    memo: ?Text;
    var status: TxStatus;
    createdAt: Int;
  };

  public type Withdrawal = {
    id: TxId;
    userId: UserId;
    amount: Nat;
    fee: Nat;
    destination: Text;
    blockIndex: ?Nat64;
    memo: ?Text;
    var status: TxStatus;
    createdAt: Int;
  };

  public type Transfer = {
    id: TxId;
    userId: UserId;
    amount: Nat;
    fee: Nat;
    from: Text;
    to: Text;
    blockIndex: ?Nat64;
    memo: ?Text;
    var status: TxStatus;
    createdAt: Int;
  };

  public type ICRC1Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type TokenStatus = {
    #pending;
    #active;
    #failed: Text;
  };

  public type Token = {
    // Assigned before the canister exists, so the canister id cannot be the key:
    // the #pending row is written before creation, and a create that succeeds
    // followed by an install that traps would otherwise leave a live canister
    // holding the user's cycles with no row pointing at it.
    id: TokenId;
    userId: UserId;
    creator: Principal;
    name: Text;
    symbol: Text;
    description: Text;
    logo: ?Text;
    website: ?Text;
    telegram: ?Text;
    twitter: ?Text;
    decimals: Nat8;
    totalSupply: Nat;
    // No controller was set at hand-off, so the wasm can never be replaced.
    immutable: Bool;
    // The launch payment. Committed before the first canister call, so a later
    // trap leaves evidence a refund can be traced to.
    paymentBlockIndex: Nat64;
    createdAt: Int;
    var status: TokenStatus;
    // Set the instant the CMC returns, which is what makes a failed install
    // retryable instead of refundable.
    var ledgerId: ?Text;
    var moduleHash: ?Blob;
    // What was funded at creation, not a live reading: this canister gives up
    // controller rights at hand-off and so cannot call canister_status.
    var cyclesFunded: ?Nat;
    // Phase 5. Declared now because adding a field to an already-persisted
    // record type needs a migration (M0170), and an unused opt does not.
    var poolId: ?Text;
  };

  public type TokenPublic = {
    id: TokenId;
    userId: UserId;
    creator: Principal;
    name: Text;
    symbol: Text;
    description: Text;
    logo: ?Text;
    website: ?Text;
    telegram: ?Text;
    twitter: ?Text;
    decimals: Nat8;
    totalSupply: Nat;
    immutable: Bool;
    status: TokenStatus;
    ledgerId: ?Text;
    // Exposed so a holder can check the deployed wasm against the published
    // audited hash themselves. "We deploy the audited wasm" is unverifiable
    // without it.
    moduleHash: ?Blob;
    cyclesFunded: ?Nat;
    createdAt: Int;
  };

  public type DashboardData = {
    user: UserPublic;
    principal: Principal;
    depositAddress: ICRC1Account;
    depositAccountIdentifier: Text;
    recentTransactions: [TransactionPublic];
    totalDeposits: Nat;
    totalWithdrawals: Nat;
    totalTransfers: Nat;
  };

  public type AuthResult = {
    #ok: { user: UserPublic; isNew: Bool };
    #err: Text;
  };

  public type ApiResult<T> = {
    #ok: T;
    #err: Text;
  };

  public func userToPublic(self: User): UserPublic {
    {
      id = self.id;
      username = self.username;
      displayName = self.displayName;
      createdAt = self.createdAt;
    };
  };

  public func txToPublic(self: Transaction): TransactionPublic {
    {
      id = self.id;
      userId = self.userId;
      txType = self.txType;
      ledgerId = self.ledgerId;
      amount = self.amount;
      fee = self.fee;
      from = self.from;
      to = self.to;
      status = self.status;
      blockIndex = self.blockIndex;
      memo = self.memo;
      createdAt = self.createdAt;
      updatedAt = self.updatedAt;
    };
  };

  public func settingsToPublic(self: Settings): SettingsPublic {
    {
      theme = self.theme;
      language = self.language;
      notifications = self.notifications;
    };
  };

  public func tokenToPublic(self: Token): TokenPublic {
    {
      id = self.id;
      userId = self.userId;
      creator = self.creator;
      name = self.name;
      symbol = self.symbol;
      description = self.description;
      logo = self.logo;
      website = self.website;
      telegram = self.telegram;
      twitter = self.twitter;
      decimals = self.decimals;
      totalSupply = self.totalSupply;
      immutable = self.immutable;
      status = self.status;
      ledgerId = self.ledgerId;
      moduleHash = self.moduleHash;
      cyclesFunded = self.cyclesFunded;
      createdAt = self.createdAt;
    };
  };
};
