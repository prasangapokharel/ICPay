import type { Principal } from "@icp-sdk/core/principal"
import type {
  AuthResult,
  ApiResult,
  ApiResult_1,
  ApiResult_2,
  ApiResult_3,
  ApiResult_7,
  ApiResult_8,
  ApiResult_9,
  ApiResult_15,
  UserPublic,
  ICRC1Account,
  TxId,
  TokenId,
  TokenPublic,
  LaunchParams,
  LaunchFee,
  AccountType,
  SocialPlatform,
  ApiResult_16,
  ApiResult_17,
  ApiResult_18,
  ApiResult_19,
  ApiResult_20,
  ApiResult_21,
  TradeDepositResult,
} from "@/services/types"

export interface WalletActor {
  health: () => Promise<string>
  login: () => Promise<AuthResult>
  _internet_identity_sign_in_start: () => Promise<Uint8Array>
  _internet_identity_sign_in_finish: () => Promise<{ ok: null } | { err: string }>
  register: (username: string) => Promise<AuthResult>
  getUser: () => Promise<[] | [UserPublic]>
  updateUsername: (newUsername: string) => Promise<ApiResult_2>
  checkUsername: (name: string) => Promise<boolean>
  searchUsers: (searchText: string) => Promise<UserPublic[]>
  resolveUsername: (name: string) => Promise<[] | [Principal]>
  getUsernamePrice: (name: string) => Promise<bigint>
  getUsernameTreasury: () => Promise<Principal>
  purchaseUsername: (name: string) => Promise<ApiResult_9>
  getDashboard: (ledgerId: string) => Promise<ApiResult_8>
  getDepositAddress: () => Promise<ICRC1Account>
  getDepositAccountIdentifier: () => Promise<string>
  syncDeposits: (ledgerId: string) => Promise<ApiResult_1>
  withdraw: (ledgerId: string, amount: bigint, to: AccountType) => Promise<ApiResult>
  transferByUsername: (ledgerId: string, username: string, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByPrincipal: (ledgerId: string, to: Principal, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByAccount: (ledgerId: string, to: AccountType, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByAccountId: (accountId: string, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  isLedgerSupported: (ledgerId: string) => Promise<boolean>
  getTransactions: (page: bigint, pageSize: bigint) => Promise<ApiResult_7>
  getUserAnalytics: () => Promise<ApiResult_20>
  exportUserAnalytics: () => Promise<ApiResult_21>
  getTransactionDetail: (txId: TxId) => Promise<ApiResult_1>
  getSettings: () => Promise<ApiResult_3>
  updateSettings: (theme: string, language: string, notifications: boolean) => Promise<ApiResult_3>
  launchToken: (params: LaunchParams) => Promise<ApiResult_15>
  getToken: (canisterId: string) => Promise<[] | [TokenPublic]>
  getTokenById: (id: TokenId) => Promise<[] | [TokenPublic]>
  getMyTokens: (limit: bigint, offset: bigint) => Promise<TokenPublic[]>
  listTokens: (limit: bigint, offset: bigint) => Promise<TokenPublic[]>
  isSymbolAvailable: (symbol: string) => Promise<boolean>
  getLaunchFee: () => Promise<LaunchFee>
  isTokenLaunchReady: () => Promise<boolean>
  setSocialLink: (platform: SocialPlatform, url: string) => Promise<ApiResult_16>
  removeSocialLink: (platform: SocialPlatform) => Promise<ApiResult_16>
  listBookmarks: () => Promise<ApiResult_18>
  addBookmark: (targetUserId: string) => Promise<ApiResult_17>
  removeBookmark: (targetUserId: string) => Promise<ApiResult_19>
  getBucketPrice: (capacityGB: bigint) => Promise<{ ok: bigint; err?: never } | { err: string; ok?: never }>
  createBucket: (name: string, capacityGB: bigint, visibility: { Public: null } | { Private: null }) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  getBucket: (id: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  getBucketStats: (id: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  getRenewQuote: (bucketId: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  listBuckets: () => Promise<{ ok: Record<string, unknown>[]; err?: never } | { err: string; ok?: never }>
  uploadFile: (
    bucketId: string,
    path: string,
    data: Uint8Array,
    contentType: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  beginFileUpload: (
    bucketId: string,
    path: string,
    contentType: string,
    totalSize: bigint,
    apiKey: [] | [string]
  ) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  uploadFileChunk: (
    uploadId: string,
    data: Uint8Array
  ) => Promise<{ ok: bigint; err?: never } | { err: string; ok?: never }>
  uploadFileChunkIndexed: (
    uploadId: string,
    chunkIndex: bigint,
    data: Uint8Array
  ) => Promise<{ ok: bigint; err?: never } | { err: string; ok?: never }>
  completeFileUpload: (
    uploadId: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  cancelUpload: (uploadId: string) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  downloadFile: (
    bucketId: string,
    path: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: Uint8Array; err?: never } | { err: string; ok?: never }>
  getPublicFileUrl: (bucketId: string, path: string) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  deleteFile: (
    bucketId: string,
    path: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  bulkDeleteFiles: (
    bucketId: string,
    paths: string[],
    apiKey: [] | [string]
  ) => Promise<{ ok: bigint; err?: never } | { err: string; ok?: never }>
  listFiles: (
    bucketId: string,
    page: bigint,
    pageSize: bigint,
    apiKey: [] | [string]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  listFolder: (
    bucketId: string,
    prefix: string,
    page: bigint,
    pageSize: bigint,
    apiKey: [] | [string]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  searchFiles: (
    bucketId: string,
    searchQuery: string,
    page: bigint,
    pageSize: bigint,
    apiKey: [] | [string]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  createFolder: (
    bucketId: string,
    path: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: string; err?: never } | { err: string; ok?: never }>
  deleteFolder: (
    bucketId: string,
    path: string,
    apiKey: [] | [string]
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  renewBucket: (bucketId: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  getBucketCycleStatus: () => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  createApiKey: (
    bucketId: string,
    name: string,
    permissions: { read: boolean; write: boolean; delete: boolean }
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  listApiKeys: (
    bucketId: string
  ) => Promise<{ ok: Record<string, unknown>[]; err?: never } | { err: string; ok?: never }>
  getApiKey: (
    bucketId: string,
    keyId: string
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  updateApiKey: (
    bucketId: string,
    keyId: string,
    name: [] | [string],
    permissions: [] | [{ read: boolean; write: boolean; delete: boolean }]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  regenerateApiKey: (
    bucketId: string,
    keyId: string
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  revokeApiKey: (
    bucketId: string,
    keyId: string
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  depositForTrade: (
    ledgerId: string,
    amount: bigint
  ) => Promise<{ ok: TradeDepositResult; err?: never } | { err: string; ok?: never }>
  withdrawFromTrade: (
    ledgerId: string,
    amount: bigint
  ) => Promise<{ ok: TradeDepositResult; err?: never } | { err: string; ok?: never }>
  createLiveRoom: (
    title: string,
    visibility: { open: null } | { inviteOnly: null },
    inviteSecret: [] | [string]
  ) => Promise<{ ok: { roomId: string; inviteToken: [] | [string] }; err?: never } | { err: string; ok?: never }>
  startLiveRoom: (roomId: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  pauseLiveRoom: (roomId: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  resumeLiveRoom: (roomId: string) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  endLiveRoom: (roomId: string) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  joinLiveRoom: (
    roomId: string,
    tabId: string,
    inviteToken: [] | [string]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  leaveLiveRoom: (roomId: string, tabId: string) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  postLiveSignal: (
    roomId: string,
    tabId: string,
    toTab: [] | [string],
    payload: string
  ) => Promise<{ ok: bigint; err?: never } | { err: string; ok?: never }>
  pollLiveSignals: (
    roomId: string,
    tabId: string,
    afterId: bigint
  ) => Promise<{ ok: Record<string, unknown>[]; err?: never } | { err: string; ok?: never }>
  getLiveRoom: (roomId: string) => Promise<[] | [Record<string, unknown>]>
  listPublicLiveRooms: (limit: bigint, offset: bigint) => Promise<Record<string, unknown>[]>
  listLivePeers: (roomId: string) => Promise<Record<string, unknown>[]>
  createCommunityChannel: (
    name: string,
    slug: string,
    bio: string,
    visibility: { open: null } | { inviteOnly: null },
    access: { free: null } | { paid: null },
    priceE8s: bigint,
    inviteSecret: [] | [string]
  ) => Promise<{ ok: { channelId: string; inviteCode: [] | [string] }; err?: never } | { err: string; ok?: never }>
  joinCommunityChannel: (
    channelId: string,
    inviteCode: [] | [string]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  leaveCommunityChannel: (channelId: string) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  postCommunityMessage: (
    channelId: string,
    text: string
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  pinCommunityMessage: (
    channelId: string,
    messageId: bigint
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  deleteCommunityMessage: (
    channelId: string,
    messageId: bigint
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  setCommunityMessageReaction: (
    channelId: string,
    messageId: bigint,
    code: number
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  setCommunityChannelAvatar: (
    channelId: string,
    avatar: [] | [Uint8Array]
  ) => Promise<{ ok: Record<string, unknown>; err?: never } | { err: string; ok?: never }>
  getCommunityChannel: (channelId: string) => Promise<[] | [Record<string, unknown>]>
  listPublicCommunityChannels: (limit: bigint, offset: bigint) => Promise<Record<string, unknown>[]>
  listMyCommunityChannels: () => Promise<{ ok: Record<string, unknown>[]; err?: never } | { err: string; ok?: never }>
  listCommunityMessages: (
    channelId: string,
    afterId: bigint,
    limit: bigint
  ) => Promise<{ ok: Record<string, unknown>[]; err?: never } | { err: string; ok?: never }>
  isCommunityMember: (channelId: string) => Promise<boolean>
  getIcpayRate: () => Promise<bigint>
  getIcpaySale: () => Promise<IcpaySaleQuote>
  buyIcpay: (icpAmount: bigint, recipient: [] | [Principal]) => Promise<IcpayPurchaseResult>
}

export type IcpaySaleQuote = {
  rate: bigint
  inventoryCap: bigint
  inventoryRemaining: bigint
  icpaySold: bigint
  icpRaised: bigint
  percentSold: bigint
  minBuyIcp: bigint
  maxBuyIcp: bigint
  active: boolean
}

export type IcpayPurchase = {
  icpBlock: bigint
  icpayBlock: bigint
  icpAmount: bigint
  icpayAmount: bigint
  destination: string
}

export type IcpayPurchaseResult = { ok: IcpayPurchase } | { err: string }
