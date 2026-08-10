import { Actor, type Identity } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import type { Principal } from "@icp-sdk/core/principal"
import { createAgent, clearAgentCache, WALLET_CANISTER_ID } from "@/services/icp"
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
  SocialLink,
  Bookmark,
  ApiResult_16,
  ApiResult_17,
  ApiResult_18,
  ApiResult_19,
} from "@/services/types"

export interface WalletActor {
  health: () => Promise<string>
  login: () => Promise<AuthResult>
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
}

let cachedActor: WalletActor | null = null
let cachedIdentity: Identity | null = null

export async function getWalletActor(identity?: Identity): Promise<WalletActor> {
  if (cachedActor && cachedIdentity === identity) {
    return cachedActor
  }

  const agent = await createAgent(identity)
  const actor = Actor.createActor<WalletActor>(walletIdl, {
    agent,
    canisterId: WALLET_CANISTER_ID,
  })

  cachedActor = actor
  cachedIdentity = identity ?? null
  return actor
}

export function clearActorCache(): void {
  cachedActor = null
  cachedIdentity = null
  clearAgentCache()
}

const walletIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const TxId = IDL.Text

  const TxType = IDL.Variant({
    deposit: IDL.Null,
    withdraw: IDL.Null,
    transfer: IDL.Null,
    fee: IDL.Null,
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
    ownerUserId: IDL.Text,
    targetUserId: IDL.Text,
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

  return IDL.Service({
    health: IDL.Func([], [IDL.Text], ["query"]),
    login: IDL.Func([], [AuthResult], []),
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
  })
}
