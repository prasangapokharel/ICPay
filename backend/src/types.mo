import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";

module {
  public type UserId = Text;
  public type Username = Text;
  public type TxId = Text;
  public type TokenId = Text;

  public type SocialPlatform = { #github; #linkedin; #website };

  public type SocialLink = {
    platform: SocialPlatform;
    url: Text;
  };

  public type User = {
    id: UserId;
    principal: Principal;
    var username: ?Username;
    var displayName: Text;
    var socialLinks: [SocialLink];
    var verifiedEmail: ?Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type UserPublic = {
    id: UserId;
    username: ?Username;
    displayName: Text;
    socialLinks: ?[SocialLink];
    createdAt: Int;
  };

  public type TxType = {
    #deposit;
    #withdraw;
    #transfer;
    #fee;
    #swapOut;
    #swapIn;
  };

  public type SwapResult = {
    blockIndex:     Nat64;
    amountIn:       Nat;
    amountOut:      Nat;
    icpServiceFee:  Nat;
    txId:           TxId;
  };

  public type SwapQuoteResult = {
    amountOut:       Nat;
    amountOutRaw:    Nat;
    icpServiceFee:   Nat;
    swapFee:         Nat;
    priceImpact:     Text;
    poolId:          Text;
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

  // Bucket types
  public type BucketId = Text;
  public type FileId = Text;

  public type BucketVisibility = { #Public; #Private };

  public type BucketStatus = { #ACTIVE; #EXPIRED };

  public type Bucket = {
    id: BucketId;
    owner: Principal;
    var name: Text;
    capacity: Nat;
    var storageUsed: Nat;
    var visibility: BucketVisibility;
    var status: BucketStatus;
    var expiresAt: Int;
    createdAt: Int;
  };

  public type BucketPublic = {
    id: BucketId;
    name: Text;
    capacity: Nat;
    storageUsed: Nat;
    visibility: BucketVisibility;
    status: BucketStatus;
    expiresAt: Int;
    createdAt: Int;
  };

  // Rich dashboard view — computed on read, nothing extra stored.
  public type BucketStats = {
    id: BucketId;
    name: Text;
    capacity: Nat;
    storageUsed: Nat;
    usagePercent: Nat;
    fileCount: Nat;
    visibility: BucketVisibility;
    status: BucketStatus;
    expiresAt: Int;
    daysRemaining: Nat;
    isExpiringSoon: Bool;
    renewPriceE8s: Nat;
    periodDays: Nat;
    publicBaseUrl: ?Text;
  };

  // Operator rollup — storage sold, cycle burn, and top-up guidance.
  public type BucketCloudStats = {
    bucketCount: Nat;
    activeBuckets: Nat;
    expiredBuckets: Nat;
    fileCount: Nat;
    storageUsedBytes: Nat;
    capacityBytes: Nat;
    utilizationPercent: Nat;
    estimatedCapacityRevenueE8s: Nat;
    cyclesBalance: Nat;
    cyclesDailyBurn: Nat;
    cyclesMonthlyBurn: Nat;
    cyclesStatus: Text;
    canAcceptNewBuckets: Bool;
    estimatedDaysRemaining: Nat;
    recommendedTopUpCycles: Nat;
  };

  public type BucketRenewQuote = {
    bucketId: BucketId;
    priceE8s: Nat;
    currentExpiresAt: Int;
    newExpiresAt: Int;
    status: BucketStatus;
  };

  public type BucketRenewResult = {
    bucketId: BucketId;
    priceE8s: Nat;
    expiresAt: Int;
    status: BucketStatus;
  };

  public type StoredFile = {
    id: FileId;
    bucketId: BucketId;
    path: Text;
    name: Text;
    size: Nat;
    contentType: Text;
    checksum: Text;
    createdAt: Int;
    updatedAt: ?Int;
    metadata: ?Text;
    tags: [Text];
  };

  public type FilePublic = {
    id: FileId;
    path: Text;
    name: Text;
    size: Nat;
    contentType: Text;
    createdAt: Int;
    updatedAt: ?Int;
    metadata: ?Text;
    tags: [Text];
    publicUrl: ?Text;
  };

  public type FilePathOp = {
    source: Text;
    destination: Text;
  };

  public type UploadStatusPublic = {
    uploadId: Text;
    bucketId: BucketId;
    path: Text;
    totalSize: Nat;
    uploadedSize: Nat;
    chunkSize: Nat;
    status: Text;
    createdAt: Int;
  };

  public type FileListPage = {
    items: [FilePublic];
    total: Nat;
    page: Nat;
    pageSize: Nat;
  };

  /** In-flight chunked upload — transient; parts keyed by index for parallel ingress. */
  public type FileUploadSession = {
    owner: Principal;
    bucketId: BucketId;
    path: Text;
    contentType: Text;
    totalSize: Nat;
    chunkCount: Nat;
    var received: Nat;
    var filled: Nat;
    var chunkParts: Map.Map<Nat, Blob>;
    createdAt: Int;
  };

  public type ApiKeyPermissions = {
    read: Bool;
    write: Bool;
    delete: Bool;
  };

  public type ApiKey = {
    id: Text;
    owner: Principal;
    bucketId: BucketId;
    name: Text;
    keyHash: Text;
    keyHint: Text;
    permissions: ApiKeyPermissions;
    createdAt: Int;
    var revokedAt: ?Int;
  };

  public type ApiKeyPublic = {
    id: Text;
    bucketId: BucketId;
    name: Text;
    keyHint: Text;
    permissions: ApiKeyPermissions;
    createdAt: Int;
    revoked: Bool;
  };

  public type ApiKeyCreateResult = {
    id: Text;
    secret: Text;
    name: Text;
    bucketId: BucketId;
    permissions: ApiKeyPermissions;
    createdAt: Int;
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

  public type AnalyticsSummary = {
    totalReceivedE8s: Nat;
    totalSentE8s: Nat;
    depositCount: Nat;
    withdrawCount: Nat;
    transferCount: Nat;
    tipCount: Nat;
    swapInCount: Nat;
    swapOutCount: Nat;
    completedCount: Nat;
    failedCount: Nat;
    uniqueCounterparties: Nat;
    freeExport: Bool;
  };

  public type AnalyticsData = {
    summary: AnalyticsSummary;
    rows: [TransactionPublic];
  };

  public type AnalyticsExportResult = {
    feePaidE8s: Nat;
    rows: [TransactionPublic];
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
      socialLinks = if (self.socialLinks.size() == 0) { null } else { ?self.socialLinks };
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

  public type Bookmark = {
    ownerUserId: UserId;
    targetUserId: UserId;
    createdAt: Int;
  };

  public type BookmarkPublic = {
    targetUserId: UserId;
    username: ?Username;
    createdAt: Int;
  };

  public type LiveVisibility = { #open; #inviteOnly };
  public type LiveState = { #draft; #live; #paused; #ended };

  public type LiveRoom = {
    id: Text;
    title: Text;
    host: Principal;
    visibility: LiveVisibility;
    inviteHash: ?Text;
    state: LiveState;
    createdAt: Int;
    endedAt: ?Int;
  };

  public type LiveRoomPublic = {
    id: Text;
    title: Text;
    host: Principal;
    hostUsername: ?Username;
    visibility: LiveVisibility;
    state: LiveState;
    peerCount: Nat;
    createdAt: Int;
  };

  public type LivePeer = {
    tabId: Text;
    principal: Principal;
    joinedAt: Int;
  };

  public type LivePeerPublic = {
    tabId: Text;
    principal: Principal;
    username: ?Username;
    joinedAt: Int;
  };

  public type LiveSignal = {
    id: Nat;
    fromTab: Text;
    toTab: ?Text;
    payload: Text;
  };

  public type LiveCreateResult = {
    roomId: Text;
    inviteToken: ?Text;
  };

  public type CommunityVisibility = { #open; #inviteOnly };
  public type CommunityAccess = { #free; #paid };

  public type CommunityChannel = {
    id: Text;
    name: Text;
    slug: Text;
    owner: Principal;
    bio: Text;
    visibility: CommunityVisibility;
    access: CommunityAccess;
    priceE8s: Nat;
    inviteHash: ?Text;
    pinnedMessageId: ?Nat;
    memberCount: Nat;
    createdAt: Int;
    channelAvatar: ?Blob;
  };

  public type CommunityChannelPublic = {
    id: Text;
    name: Text;
    slug: Text;
    owner: Principal;
    ownerUsername: ?Username;
    bio: Text;
    visibility: CommunityVisibility;
    access: CommunityAccess;
    priceE8s: Nat;
    pinnedMessageId: ?Nat;
    memberCount: Nat;
    createdAt: Int;
    channelAvatar: ?Blob;
  };

  public type CommunityMember = {
    joinedAt: Int;
  };

  public type CommunityMessage = {
    id: Nat;
    author: Principal;
    text: Text;
    createdAt: Int;
    deleted: Bool;
  };

  public type CommunityReactionCode = Nat8;

  public type CommunityReactionCount = {
    code: CommunityReactionCode;
    count: Nat;
  };

  public type CommunityMessagePublic = {
    id: Nat;
    author: Principal;
    authorUsername: ?Username;
    text: Text;
    createdAt: Int;
    reactions: [CommunityReactionCount];
    myReaction: ?CommunityReactionCode;
  };

  public type CommunityReactionUpdate = {
    messageId: Nat;
    myReaction: ?CommunityReactionCode;
    reactions: [CommunityReactionCount];
  };

  public type CommunityCreateResult = {
    channelId: Text;
    inviteCode: ?Text;
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
