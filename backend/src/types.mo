import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  public type UserId = Text;
  public type Username = Text;
  public type TxId = Text;

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
};
