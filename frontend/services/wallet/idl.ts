import type { IDL } from "@icp-sdk/core/candid"

export const walletIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const TxId = IDL.Text

  const TxType = IDL.Variant({
    deposit: IDL.Null,
    withdraw: IDL.Null,
    transfer: IDL.Null,
    fee: IDL.Null,
    swapIn: IDL.Null,
    swapOut: IDL.Null,
  })

  const TxStatus = IDL.Variant({
    pending: IDL.Null,
    completed: IDL.Null,
    failed: IDL.Null,
    cancelled: IDL.Null,
  })

  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })

  const SocialPlatform = IDL.Variant({
    github: IDL.Null,
    linkedin: IDL.Null,
    website: IDL.Null,
  })

  const SocialLink = IDL.Record({
    platform: SocialPlatform,
    url: IDL.Text,
  })

  const Bookmark = IDL.Record({
    targetUserId: IDL.Text,
    username: IDL.Opt(IDL.Text),
    createdAt: IDL.Int,
  })

  const UserPublic = IDL.Record({
    id: IDL.Text,
    username: IDL.Opt(IDL.Text),
    displayName: IDL.Text,
    socialLinks: IDL.Opt(IDL.Vec(SocialLink)),
    createdAt: IDL.Int,
  })

  const TransactionPublic = IDL.Record({
    id: TxId,
    userId: IDL.Text,
    txType: TxType,
    ledgerId: IDL.Text,
    amount: IDL.Nat,
    fee: IDL.Nat,
    from: IDL.Text,
    to: IDL.Text,
    status: TxStatus,
    blockIndex: IDL.Opt(IDL.Nat64),
    memo: IDL.Opt(IDL.Text),
    createdAt: IDL.Int,
    updatedAt: IDL.Int,
  })

  const SettingsPublic = IDL.Record({
    theme: IDL.Text,
    language: IDL.Text,
    notifications: IDL.Bool,
  })

  const DashboardData = IDL.Record({
    user: UserPublic,
    principal: IDL.Principal,
    depositAddress: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    depositAccountIdentifier: IDL.Text,
    recentTransactions: IDL.Vec(TransactionPublic),
    totalDeposits: IDL.Nat,
    totalWithdrawals: IDL.Nat,
    totalTransfers: IDL.Nat,
  })

  const AuthResult = IDL.Variant({
    ok: IDL.Record({ user: UserPublic, isNew: IDL.Bool }),
    err: IDL.Text,
  })

  const ApiResult = IDL.Variant({
    ok: IDL.Record({ blockIndex: IDL.Nat64, txId: TxId }),
    err: IDL.Text,
  })

  const ApiResult_1 = IDL.Variant({
    ok: TransactionPublic,
    err: IDL.Text,
  })

  const ApiResult_2 = IDL.Variant({
    ok: UserPublic,
    err: IDL.Text,
  })

  const ApiResult_3 = IDL.Variant({
    ok: SettingsPublic,
    err: IDL.Text,
  })

  const ApiResult_7 = IDL.Variant({
    ok: IDL.Record({
      items: IDL.Vec(TransactionPublic),
      total: IDL.Nat,
      page: IDL.Nat,
      pageSize: IDL.Nat,
    }),
    err: IDL.Text,
  })

  const ApiResult_8 = IDL.Variant({
    ok: DashboardData,
    err: IDL.Text,
  })

  const Purchase = IDL.Record({
    blockIndex: IDL.Nat64,
    price: IDL.Nat,
    txId: TxId,
    username: IDL.Text,
  })

  const ApiResult_9 = IDL.Variant({
    ok: Purchase,
    err: IDL.Text,
  })

  const TokenId = IDL.Text

  const TokenStatus = IDL.Variant({
    pending: IDL.Null,
    active: IDL.Null,
    failed: IDL.Text,
  })

  const TokenPublic = IDL.Record({
    id: TokenId,
    userId: IDL.Text,
    creator: IDL.Principal,
    name: IDL.Text,
    symbol: IDL.Text,
    description: IDL.Text,
    logo: IDL.Opt(IDL.Text),
    website: IDL.Opt(IDL.Text),
    telegram: IDL.Opt(IDL.Text),
    twitter: IDL.Opt(IDL.Text),
    decimals: IDL.Nat8,
    totalSupply: IDL.Nat,
    immutable: IDL.Bool,
    status: TokenStatus,
    ledgerId: IDL.Opt(IDL.Text),
    moduleHash: IDL.Opt(IDL.Vec(IDL.Nat8)),
    cyclesFunded: IDL.Opt(IDL.Nat),
    createdAt: IDL.Int,
  })

  const LaunchParams = IDL.Record({
    name: IDL.Text,
    symbol: IDL.Text,
    description: IDL.Text,
    logo: IDL.Opt(IDL.Text),
    website: IDL.Opt(IDL.Text),
    telegram: IDL.Opt(IDL.Text),
    twitter: IDL.Opt(IDL.Text),
    decimals: IDL.Nat8,
    totalSupply: IDL.Nat,
    immutable: IDL.Bool,
  })

  const ApiResult_15 = IDL.Variant({
    ok: TokenPublic,
    err: IDL.Text,
  })

  const AnalyticsSummary = IDL.Record({
    totalReceivedE8s: IDL.Nat,
    totalSentE8s: IDL.Nat,
    depositCount: IDL.Nat,
    withdrawCount: IDL.Nat,
    transferCount: IDL.Nat,
    tipCount: IDL.Nat,
    swapInCount: IDL.Nat,
    swapOutCount: IDL.Nat,
    completedCount: IDL.Nat,
    failedCount: IDL.Nat,
    uniqueCounterparties: IDL.Nat,
    freeExport: IDL.Bool,
  })

  const AnalyticsData = IDL.Record({
    summary: AnalyticsSummary,
    rows: IDL.Vec(TransactionPublic),
  })

  const AnalyticsExportResult = IDL.Record({
    feePaidE8s: IDL.Nat,
    rows: IDL.Vec(TransactionPublic),
  })

  const ApiResult_20 = IDL.Variant({ ok: AnalyticsData, err: IDL.Text })
  const ApiResult_21 = IDL.Variant({ ok: AnalyticsExportResult, err: IDL.Text })

  const TradeDepositResult = IDL.Record({
    blockIndex: IDL.Nat64,
  })

  const ApiResultTradeDeposit = IDL.Variant({ ok: TradeDepositResult, err: IDL.Text })

  const BucketVisibility = IDL.Variant({
    Public: IDL.Null,
    Private: IDL.Null,
  })

  const BucketStatus = IDL.Variant({
    ACTIVE: IDL.Null,
    EXPIRED: IDL.Null,
  })

  const BucketPublic = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    capacity: IDL.Nat,
    storageUsed: IDL.Nat,
    visibility: BucketVisibility,
    status: BucketStatus,
    expiresAt: IDL.Int,
    createdAt: IDL.Int,
  })

  const BucketStats = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    capacity: IDL.Nat,
    storageUsed: IDL.Nat,
    usagePercent: IDL.Nat,
    fileCount: IDL.Nat,
    visibility: BucketVisibility,
    status: BucketStatus,
    expiresAt: IDL.Int,
    daysRemaining: IDL.Nat,
    isExpiringSoon: IDL.Bool,
    renewPriceE8s: IDL.Nat,
    periodDays: IDL.Nat,
    publicBaseUrl: IDL.Opt(IDL.Text),
  })

  const BucketRenewQuote = IDL.Record({
    bucketId: IDL.Text,
    priceE8s: IDL.Nat,
    currentExpiresAt: IDL.Int,
    newExpiresAt: IDL.Int,
    status: BucketStatus,
  })

  const BucketRenewResult = IDL.Record({
    bucketId: IDL.Text,
    priceE8s: IDL.Nat,
    expiresAt: IDL.Int,
    status: BucketStatus,
  })

  const FilePublic = IDL.Record({
    id: IDL.Text,
    path: IDL.Text,
    name: IDL.Text,
    size: IDL.Nat,
    contentType: IDL.Text,
    createdAt: IDL.Int,
    updatedAt: IDL.Opt(IDL.Int),
    metadata: IDL.Opt(IDL.Text),
    tags: IDL.Vec(IDL.Text),
    publicUrl: IDL.Opt(IDL.Text),
  })

  const FilePathOp = IDL.Record({
    source: IDL.Text,
    destination: IDL.Text,
  })

  const UploadStatusPublic = IDL.Record({
    uploadId: IDL.Text,
    bucketId: IDL.Text,
    path: IDL.Text,
    totalSize: IDL.Nat,
    uploadedSize: IDL.Nat,
    chunkSize: IDL.Nat,
    status: IDL.Text,
    createdAt: IDL.Int,
  })

  const ApiResultBucketId = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const ApiResultBucketPublic = IDL.Variant({ ok: BucketPublic, err: IDL.Text })
  const ApiResultBucketStats = IDL.Variant({ ok: BucketStats, err: IDL.Text })
  const ApiResultRenewQuote = IDL.Variant({ ok: BucketRenewQuote, err: IDL.Text })
  const ApiResultRenew = IDL.Variant({ ok: BucketRenewResult, err: IDL.Text })
  const ApiResultFileId = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const ApiResultBlob = IDL.Variant({ ok: IDL.Vec(IDL.Nat8), err: IDL.Text })
  const ApiResultUrl = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const ApiResultUnit = IDL.Variant({ ok: IDL.Null, err: IDL.Text })
  const ApiResultBucketList = IDL.Variant({ ok: IDL.Vec(BucketPublic), err: IDL.Text })
  const ApiResultFileList = IDL.Variant({
    ok: IDL.Record({
      items: IDL.Vec(FilePublic),
      total: IDL.Nat,
      page: IDL.Nat,
      pageSize: IDL.Nat,
    }),
    err: IDL.Text,
  })
  const ApiResultNat = IDL.Variant({ ok: IDL.Nat, err: IDL.Text })
  const ApiResultCycleStatus = IDL.Variant({
    ok: IDL.Record({
      balance: IDL.Nat,
      status: IDL.Text,
      canAcceptNewBuckets: IDL.Bool,
      estimatedDaysRemaining: IDL.Nat,
      dailyBurn: IDL.Nat,
    }),
    err: IDL.Text,
  })

  const ApiKeyPermissions = IDL.Record({
    read: IDL.Bool,
    write: IDL.Bool,
    delete: IDL.Bool,
  })

  const ApiKeyPublic = IDL.Record({
    id: IDL.Text,
    bucketId: IDL.Text,
    name: IDL.Text,
    keyHint: IDL.Text,
    permissions: ApiKeyPermissions,
    createdAt: IDL.Int,
    revoked: IDL.Bool,
  })

  const ApiKeyCreateResult = IDL.Record({
    id: IDL.Text,
    secret: IDL.Text,
    name: IDL.Text,
    bucketId: IDL.Text,
    permissions: ApiKeyPermissions,
    createdAt: IDL.Int,
  })

  const ApiResultApiKeyCreate = IDL.Variant({ ok: ApiKeyCreateResult, err: IDL.Text })
  const ApiResultApiKeyList = IDL.Variant({ ok: IDL.Vec(ApiKeyPublic), err: IDL.Text })
  const ApiResultApiKeyPublic = IDL.Variant({ ok: ApiKeyPublic, err: IDL.Text })
  const ApiResultFilePublic = IDL.Variant({ ok: FilePublic, err: IDL.Text })
  const ApiResultBool = IDL.Variant({ ok: IDL.Bool, err: IDL.Text })
  const ApiResultText = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const ApiResultUploadStatus = IDL.Variant({ ok: UploadStatusPublic, err: IDL.Text })

  const LiveVisibility = IDL.Variant({ open: IDL.Null, inviteOnly: IDL.Null })
  const LiveState = IDL.Variant({
    draft: IDL.Null,
    live: IDL.Null,
    paused: IDL.Null,
    ended: IDL.Null,
  })
  const LiveRoomPublic = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    host: IDL.Principal,
    hostUsername: IDL.Opt(IDL.Text),
    visibility: LiveVisibility,
    state: LiveState,
    peerCount: IDL.Nat,
    createdAt: IDL.Int,
  })
  const LivePeer = IDL.Record({
    tabId: IDL.Text,
    principal: IDL.Principal,
    username: IDL.Opt(IDL.Text),
    joinedAt: IDL.Int,
  })
  const LiveSignal = IDL.Record({
    id: IDL.Nat,
    fromTab: IDL.Text,
    toTab: IDL.Opt(IDL.Text),
    payload: IDL.Text,
  })
  const LiveCreateResult = IDL.Record({
    roomId: IDL.Text,
    inviteToken: IDL.Opt(IDL.Text),
  })
  const ApiResultLiveCreate = IDL.Variant({ ok: LiveCreateResult, err: IDL.Text })
  const ApiResultLiveRoom = IDL.Variant({ ok: LiveRoomPublic, err: IDL.Text })
  const ApiResultLiveSignals = IDL.Variant({ ok: IDL.Vec(LiveSignal), err: IDL.Text })

  const CommunityVisibility = IDL.Variant({ open: IDL.Null, inviteOnly: IDL.Null })
  const CommunityAccess = IDL.Variant({ free: IDL.Null, paid: IDL.Null })
  const CommunityChannelPublic = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    slug: IDL.Text,
    owner: IDL.Principal,
    ownerUsername: IDL.Opt(IDL.Text),
    bio: IDL.Text,
    visibility: CommunityVisibility,
    access: CommunityAccess,
    priceE8s: IDL.Nat,
    pinnedMessageId: IDL.Opt(IDL.Nat),
    memberCount: IDL.Nat,
    createdAt: IDL.Int,
    channelAvatar: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const CommunityReactionCount = IDL.Record({
    code: IDL.Nat8,
    count: IDL.Nat,
  })
  const CommunityMessagePublic = IDL.Record({
    id: IDL.Nat,
    author: IDL.Principal,
    authorUsername: IDL.Opt(IDL.Text),
    text: IDL.Text,
    createdAt: IDL.Int,
    reactions: IDL.Vec(CommunityReactionCount),
    myReaction: IDL.Opt(IDL.Nat8),
  })
  const CommunityReactionUpdate = IDL.Record({
    messageId: IDL.Nat,
    myReaction: IDL.Opt(IDL.Nat8),
    reactions: IDL.Vec(CommunityReactionCount),
  })
  const CommunityCreateResult = IDL.Record({
    channelId: IDL.Text,
    inviteCode: IDL.Opt(IDL.Text),
  })
  const ApiResultCommunityCreate = IDL.Variant({ ok: CommunityCreateResult, err: IDL.Text })
  const ApiResultCommunityChannel = IDL.Variant({ ok: CommunityChannelPublic, err: IDL.Text })
  const ApiResultCommunityChannels = IDL.Variant({ ok: IDL.Vec(CommunityChannelPublic), err: IDL.Text })
  const ApiResultCommunityMessages = IDL.Variant({ ok: IDL.Vec(CommunityMessagePublic), err: IDL.Text })
  const ApiResultCommunityReactionUpdate = IDL.Variant({
    ok: CommunityReactionUpdate,
    err: IDL.Text,
  })

  const IcpaySaleQuote = IDL.Record({
    rate: IDL.Nat,
    inventoryCap: IDL.Nat,
    inventoryRemaining: IDL.Nat,
    icpaySold: IDL.Nat,
    icpRaised: IDL.Nat,
    percentSold: IDL.Nat,
    minBuyIcp: IDL.Nat,
    maxBuyIcp: IDL.Nat,
    active: IDL.Bool,
  })
  const IcpayPurchase = IDL.Record({
    icpBlock: IDL.Nat64,
    icpayBlock: IDL.Nat64,
    icpAmount: IDL.Nat,
    icpayAmount: IDL.Nat,
    destination: IDL.Text,
  })
  const ApiResultIcpayPurchase = IDL.Variant({ ok: IcpayPurchase, err: IDL.Text })

  return IDL.Service({
    health: IDL.Func([], [IDL.Text], ["query"]),
    login: IDL.Func([], [AuthResult], []),
    _internet_identity_sign_in_start: IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    _internet_identity_sign_in_finish: IDL.Func(
      [],
      [IDL.Variant({ ok: IDL.Null, err: IDL.Text })],
      [],
    ),
    register: IDL.Func([IDL.Text], [AuthResult], []),
    getUser: IDL.Func([], [IDL.Opt(UserPublic)], ["query"]),
    updateUsername: IDL.Func([IDL.Text], [ApiResult_2], []),
    checkUsername: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    searchUsers: IDL.Func([IDL.Text], [IDL.Vec(UserPublic)], ["query"]),
    resolveUsername: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ["query"]),
    getUsernamePrice: IDL.Func([IDL.Text], [IDL.Nat], ["query"]),
    getUsernameTreasury: IDL.Func([], [IDL.Principal], ["query"]),
    purchaseUsername: IDL.Func([IDL.Text], [ApiResult_9], []),
    getDashboard: IDL.Func([IDL.Text], [ApiResult_8], ["query"]),
    getDepositAddress: IDL.Func([], [IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)) })], ["query"]),
    getDepositAccountIdentifier: IDL.Func([], [IDL.Text], ["query"]),
    syncDeposits: IDL.Func([IDL.Text], [ApiResult_1], []),
    withdraw: IDL.Func([IDL.Text, IDL.Nat, Account], [ApiResult], []),
    transferByUsername: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByPrincipal: IDL.Func([IDL.Text, IDL.Principal, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByAccount: IDL.Func([IDL.Text, Account, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByAccountId: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    isLedgerSupported: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    getTransactions: IDL.Func([IDL.Nat, IDL.Nat], [ApiResult_7], ["query"]),
    getUserAnalytics: IDL.Func([], [ApiResult_20], ["query"]),
    exportUserAnalytics: IDL.Func([], [ApiResult_21], []),
    getTransactionDetail: IDL.Func([TxId], [ApiResult_1], ["query"]),
    getSettings: IDL.Func([], [ApiResult_3], []),
    updateSettings: IDL.Func([IDL.Text, IDL.Text, IDL.Bool], [ApiResult_3], []),
    launchToken: IDL.Func([LaunchParams], [ApiResult_15], []),
    getToken: IDL.Func([IDL.Text], [IDL.Opt(TokenPublic)], ["query"]),
    getTokenById: IDL.Func([TokenId], [IDL.Opt(TokenPublic)], ["query"]),
    getMyTokens: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(TokenPublic)], ["query"]),
    listTokens: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(TokenPublic)], ["query"]),
    isSymbolAvailable: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    getLaunchFee: IDL.Func([], [IDL.Record({ total: IDL.Nat, cycles: IDL.Nat })], ["query"]),
    isTokenLaunchReady: IDL.Func([], [IDL.Bool], ["query"]),
    setSocialLink: IDL.Func([SocialPlatform, IDL.Text], [IDL.Variant({ ok: UserPublic, err: IDL.Text })], []),
    removeSocialLink: IDL.Func([SocialPlatform], [IDL.Variant({ ok: UserPublic, err: IDL.Text })], []),
    listBookmarks: IDL.Func([], [IDL.Variant({ ok: IDL.Vec(Bookmark), err: IDL.Text })], ["query"]),
    addBookmark: IDL.Func([IDL.Text], [IDL.Variant({ ok: Bookmark, err: IDL.Text })], []),
    removeBookmark: IDL.Func([IDL.Text], [IDL.Variant({ ok: IDL.Null, err: IDL.Text })], []),
    getBucketPrice: IDL.Func([IDL.Nat], [ApiResultNat], ["query"]),
    createBucket: IDL.Func([IDL.Text, IDL.Nat, BucketVisibility], [ApiResultBucketId], []),
    getBucket: IDL.Func([IDL.Text], [ApiResultBucketPublic], ["query"]),
    getBucketStats: IDL.Func([IDL.Text], [ApiResultBucketStats], ["query"]),
    getRenewQuote: IDL.Func([IDL.Text], [ApiResultRenewQuote], ["query"]),
    listBuckets: IDL.Func([], [ApiResultBucketList], ["query"]),
    uploadFile: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultFileId],
      []
    ),
    beginFileUpload: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)],
      [ApiResultBucketId],
      []
    ),
    uploadFileChunk: IDL.Func(
      [IDL.Text, IDL.Vec(IDL.Nat8)],
      [ApiResultNat],
      []
    ),
    uploadFileChunkIndexed: IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Vec(IDL.Nat8)],
      [ApiResultNat],
      []
    ),
    completeFileUpload: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultFileId],
      []
    ),
    downloadFile: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [ApiResultBlob], []),
    getPublicFileUrl: IDL.Func([IDL.Text, IDL.Text], [ApiResultUrl], ["query"]),
    deleteFile: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [ApiResultUnit], []),
    listFiles: IDL.Func([IDL.Text, IDL.Nat, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResultFileList], ["query"]),
    renewBucket: IDL.Func([IDL.Text], [ApiResultRenew], []),
    getBucketCycleStatus: IDL.Func([], [ApiResultCycleStatus], ["query"]),
    createApiKey: IDL.Func(
      [IDL.Text, IDL.Text, ApiKeyPermissions],
      [ApiResultApiKeyCreate],
      []
    ),
    listApiKeys: IDL.Func([IDL.Text], [ApiResultApiKeyList], ["query"]),
    getApiKey: IDL.Func([IDL.Text, IDL.Text], [ApiResultApiKeyPublic], ["query"]),
    updateApiKey: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(ApiKeyPermissions)],
      [ApiResultApiKeyPublic],
      []
    ),
    regenerateApiKey: IDL.Func([IDL.Text, IDL.Text], [ApiResultApiKeyCreate], []),
    revokeApiKey: IDL.Func([IDL.Text, IDL.Text], [ApiResultUnit], []),
    getFile: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [ApiResultFilePublic], ["query"]),
    fileExists: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [ApiResultBool], ["query"]),
    updateFile: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    moveFile: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    copyFile: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    listFolder: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Opt(IDL.Text)],
      [ApiResultFileList],
      ["query"]
    ),
    searchFiles: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Opt(IDL.Text)],
      [ApiResultFileList],
      ["query"]
    ),
    setFileTags: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    addFileTags: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    removeFileTags: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    getFileMetadata: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [ApiResultText], ["query"]),
    setFileMetadata: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultFilePublic],
      []
    ),
    bulkDeleteFiles: IDL.Func([IDL.Text, IDL.Vec(IDL.Text), IDL.Opt(IDL.Text)], [ApiResultNat], []),
    bulkMoveFiles: IDL.Func(
      [IDL.Text, IDL.Vec(FilePathOp), IDL.Opt(IDL.Text)],
      [ApiResultNat],
      []
    ),
    bulkCopyFiles: IDL.Func(
      [IDL.Text, IDL.Vec(FilePathOp), IDL.Opt(IDL.Text)],
      [ApiResultNat],
      []
    ),
    getUpload: IDL.Func([IDL.Text], [ApiResultUploadStatus], ["query"]),
    cancelUpload: IDL.Func([IDL.Text], [ApiResultUnit], []),
    updateBucket: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(BucketVisibility)],
      [ApiResultBucketPublic],
      []
    ),
    deleteBucket: IDL.Func([IDL.Text], [ApiResultUnit], []),
    depositForTrade: IDL.Func([IDL.Text, IDL.Nat], [ApiResultTradeDeposit], []),
    withdrawFromTrade: IDL.Func([IDL.Text, IDL.Nat], [ApiResultTradeDeposit], []),
    createLiveRoom: IDL.Func(
      [IDL.Text, LiveVisibility, IDL.Opt(IDL.Text)],
      [ApiResultLiveCreate],
      []
    ),
    startLiveRoom: IDL.Func([IDL.Text], [ApiResultLiveRoom], []),
    pauseLiveRoom: IDL.Func([IDL.Text], [ApiResultLiveRoom], []),
    resumeLiveRoom: IDL.Func([IDL.Text], [ApiResultLiveRoom], []),
    endLiveRoom: IDL.Func([IDL.Text], [ApiResultUnit], []),
    joinLiveRoom: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultLiveRoom],
      []
    ),
    leaveLiveRoom: IDL.Func([IDL.Text, IDL.Text], [ApiResultUnit], []),
    postLiveSignal: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Text],
      [ApiResultNat],
      []
    ),
    pollLiveSignals: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat],
      [ApiResultLiveSignals],
      ["query"]
    ),
    getLiveRoom: IDL.Func([IDL.Text], [IDL.Opt(LiveRoomPublic)], ["query"]),
    listPublicLiveRooms: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(LiveRoomPublic)], ["query"]),
    listLivePeers: IDL.Func([IDL.Text], [IDL.Vec(LivePeer)], ["query"]),
    createCommunityChannel: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, CommunityVisibility, CommunityAccess, IDL.Nat, IDL.Opt(IDL.Text)],
      [ApiResultCommunityCreate],
      []
    ),
    joinCommunityChannel: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text)],
      [ApiResultCommunityChannel],
      []
    ),
    leaveCommunityChannel: IDL.Func([IDL.Text], [ApiResultUnit], []),
    postCommunityMessage: IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ ok: CommunityMessagePublic, err: IDL.Text })], []),
    pinCommunityMessage: IDL.Func([IDL.Text, IDL.Nat], [ApiResultCommunityChannel], []),
    deleteCommunityMessage: IDL.Func([IDL.Text, IDL.Nat], [ApiResultUnit], []),
    setCommunityMessageReaction: IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Nat8],
      [ApiResultCommunityReactionUpdate],
      []
    ),
    setCommunityChannelAvatar: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Vec(IDL.Nat8))],
      [ApiResultCommunityChannel],
      []
    ),
    getCommunityChannel: IDL.Func([IDL.Text], [IDL.Opt(CommunityChannelPublic)], ["query"]),
    listPublicCommunityChannels: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(CommunityChannelPublic)], ["query"]),
    listMyCommunityChannels: IDL.Func([], [ApiResultCommunityChannels], ["query"]),
    listCommunityMessages: IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Nat],
      [ApiResultCommunityMessages],
      ["query"]
    ),
    isCommunityMember: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    getIcpayRate: IDL.Func([], [IDL.Nat], ["query"]),
    getIcpaySale: IDL.Func([], [IcpaySaleQuote], []),
    buyIcpay: IDL.Func([IDL.Nat, IDL.Opt(IDL.Principal)], [ApiResultIcpayPurchase], []),
  })
}
