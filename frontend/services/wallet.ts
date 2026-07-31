import { Actor, type Identity } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"
import { createAgent, WALLET_CANISTER_ID } from "@/services/icp"
import type {
  AuthResult,
  ApiResult,
  ApiResult_1,
  ApiResult_2,
  ApiResult_3,
  ApiResult_7,
  ApiResult_8,
  UserPublic,
  DashboardData,
  SettingsPublic,
  ICRC1Account,
  TxId,
  AccountType,
} from "@/services/types"

export interface WalletActor {
  health: () => Promise<string>
  login: () => Promise<AuthResult>
  register: (username: string) => Promise<AuthResult>
  getProfile: () => Promise<[] | [UserPublic]>
  getUser: () => Promise<[] | [UserPublic]>
  updateUsername: (newUsername: string) => Promise<ApiResult_2>
  checkUsername: (name: string) => Promise<boolean>
  searchUsers: (searchText: string) => Promise<UserPublic[]>
  resolveUsername: (name: string) => Promise<[] | [Principal]>
  getDashboard: () => Promise<ApiResult_8>
  getDepositAddress: () => Promise<ICRC1Account>
  getDepositAccountIdentifier: () => Promise<string>
  syncDeposits: () => Promise<ApiResult_1>
  withdraw: (amount: bigint, to: AccountType) => Promise<ApiResult>
  transferByUsername: (username: string, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByPrincipal: (to: Principal, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByAccount: (to: AccountType, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  transferByAccountId: (accountId: string, amount: bigint, memo: [] | [string]) => Promise<ApiResult>
  getTransactions: (page: bigint, pageSize: bigint) => Promise<ApiResult_7>
  getTransactionDetail: (txId: TxId) => Promise<ApiResult_1>
  getExplorerUrl: (txId: TxId) => Promise<string>
  getSettings: () => Promise<ApiResult_3>
  updateSettings: (theme: string, language: string, notifications: boolean) => Promise<ApiResult_3>
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
}

const walletIdl = ({ IDL }: { IDL: any }) => {
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

  const UserPublic = IDL.Record({
    id: IDL.Text,
    username: IDL.Opt(IDL.Text),
    displayName: IDL.Text,
    createdAt: IDL.Int,
  })

  const TransactionPublic = IDL.Record({
    id: TxId,
    userId: IDL.Text,
    txType: TxType,
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
    icpBalance: IDL.Nat,
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

  return IDL.Service({
    health: IDL.Func([], [IDL.Text], ["query"]),
    login: IDL.Func([], [AuthResult], []),
    register: IDL.Func([IDL.Text], [AuthResult], []),
    getProfile: IDL.Func([], [IDL.Opt(UserPublic)], ["query"]),
    getUser: IDL.Func([], [IDL.Opt(UserPublic)], ["query"]),
    updateUsername: IDL.Func([IDL.Text], [ApiResult_2], []),
    checkUsername: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    searchUsers: IDL.Func([IDL.Text], [IDL.Vec(UserPublic)], ["query"]),
    resolveUsername: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ["query"]),
    getDashboard: IDL.Func([], [ApiResult_8], []),
    getDepositAddress: IDL.Func([], [IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)) })], ["query"]),
    getDepositAccountIdentifier: IDL.Func([], [IDL.Text], ["query"]),
    syncDeposits: IDL.Func([], [ApiResult_1], []),
    withdraw: IDL.Func([IDL.Nat, Account], [ApiResult], []),
    transferByUsername: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByPrincipal: IDL.Func([IDL.Principal, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByAccount: IDL.Func([Account, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    transferByAccountId: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [ApiResult], []),
    getTransactions: IDL.Func([IDL.Nat, IDL.Nat], [ApiResult_7], []),
    getTransactionDetail: IDL.Func([TxId], [ApiResult_1], []),
    getExplorerUrl: IDL.Func([TxId], [IDL.Text], ["query"]),
    getSettings: IDL.Func([], [ApiResult_3], []),
    updateSettings: IDL.Func([IDL.Text, IDL.Text, IDL.Bool], [ApiResult_3], []),
  })
}
