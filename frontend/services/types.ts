import type { Principal } from "@icp-sdk/core/principal"

export type UserId = string
export type TxId = string
export type Username = string

export type TxTypeVariant =
  | { deposit: null }
  | { withdraw: null }
  | { transfer: null }
  | { fee: null }

export type TxStatusVariant =
  | { pending: null }
  | { completed: null }
  | { failed: null }
  | { cancelled: null }

export type AccountType = {
  owner: Principal
  subaccount: [] | [Uint8Array | number[]]
}

export type UserPublic = {
  id: UserId
  username: [] | [Username]
  displayName: string
  socialLinks: [] | [SocialLink[]]
  createdAt: bigint
}

export type SocialPlatform = { github: null } | { linkedin: null } | { website: null }

export type SocialLink = {
  platform: SocialPlatform
  url: string
}

export type Bookmark = {
  ownerUserId: UserId
  targetUserId: UserId
  createdAt: bigint
}

export type TransactionPublic = {
  id: TxId
  userId: UserId
  txType: TxTypeVariant
  ledgerId: string
  amount: bigint
  fee: bigint
  from: string
  to: string
  status: TxStatusVariant
  blockIndex: [] | [bigint]
  memo: [] | [string]
  createdAt: bigint
  updatedAt: bigint
}

export type SettingsPublic = {
  theme: string
  language: string
  notifications: boolean
}

export type ICRC1Account = {
  owner: Principal
  subaccount: [] | [Uint8Array | number[]]
}

export type DashboardData = {
  user: UserPublic
  principal: Principal
  depositAddress: ICRC1Account
  depositAccountIdentifier: string
  recentTransactions: TransactionPublic[]
  totalDeposits: bigint
  totalWithdrawals: bigint
  totalTransfers: bigint
}

export type TransferResult = {
  blockIndex: bigint
  txId: TxId
}

export type PaginatedResult = {
  items: TransactionPublic[]
  total: bigint
  page: bigint
  pageSize: bigint
}

export type Purchase = {
  blockIndex: bigint
  price: bigint
  txId: string
  username: string
}

export type TokenId = string

export type TokenStatusVariant =
  | { pending: null }
  | { active: null }
  | { failed: string }

export type TokenPublic = {
  id: TokenId
  userId: UserId
  creator: Principal
  name: string
  symbol: string
  description: string
  logo: [] | [string]
  website: [] | [string]
  telegram: [] | [string]
  twitter: [] | [string]
  decimals: number
  totalSupply: bigint
  immutable: boolean
  status: TokenStatusVariant
  ledgerId: [] | [string]
  // Exposed so a holder can check the deployed code against the published hash
  // rather than taking "we deploy the audited wasm" on trust.
  moduleHash: [] | [Uint8Array | number[]]
  cyclesFunded: [] | [bigint]
  createdAt: bigint
}

export type LaunchParams = {
  name: string
  symbol: string
  description: string
  logo: [] | [string]
  website: [] | [string]
  telegram: [] | [string]
  twitter: [] | [string]
  decimals: number
  totalSupply: bigint
  immutable: boolean
}

export type LaunchFee = {
  total: bigint
  cycles: bigint
}

export type AuthResult = { ok: { user: UserPublic; isNew: boolean } } | { err: string }
export type ApiResult = { ok: TransferResult } | { err: string }
export type ApiResult_1 = { ok: TransactionPublic } | { err: string }
export type ApiResult_2 = { ok: UserPublic } | { err: string }
export type ApiResult_3 = { ok: SettingsPublic } | { err: string }
export type ApiResult_7 = { ok: PaginatedResult } | { err: string }
export type ApiResult_8 = { ok: DashboardData } | { err: string }
export type ApiResult_9 = { ok: Purchase } | { err: string }
export type ApiResult_15 = { ok: TokenPublic } | { err: string }
export type ApiResult_16 = { ok: UserPublic } | { err: string }
export type ApiResult_17 = { ok: Bookmark } | { err: string }
export type ApiResult_18 = { ok: Bookmark[] } | { err: string }
export type ApiResult_19 = { ok: null } | { err: string }
