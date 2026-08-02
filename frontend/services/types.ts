import type { Principal } from "@dfinity/principal"

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
  createdAt: bigint
}

export type TransactionPublic = {
  id: TxId
  userId: UserId
  txType: TxTypeVariant
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

export type AuthResult = { ok: { user: UserPublic; isNew: boolean } } | { err: string }
export type ApiResult = { ok: TransferResult } | { err: string }
export type ApiResult_1 = { ok: TransactionPublic } | { err: string }
export type ApiResult_2 = { ok: UserPublic } | { err: string }
export type ApiResult_3 = { ok: SettingsPublic } | { err: string }
export type ApiResult_7 = { ok: PaginatedResult } | { err: string }
export type ApiResult_8 = { ok: DashboardData } | { err: string }
export type ApiResult_9 = { ok: Purchase } | { err: string }
