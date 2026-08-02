import { Actor, type Identity } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@/services/icp"

// The NNS ICP index canister. It mirrors the ledger and answers by query, so
// reading a public account costs nothing and never touches the ICPay canister.
const ICP_INDEX_ID = "qhbym-qaaaa-aaaaa-aaafq-cai"

export type AccountStats = {
  balance: bigint
  txCount: number
  // Absent for an account the index has never seen a transaction for.
  firstBlock?: bigint
  lastBlock?: bigint
  lastActivity?: bigint
}

// Only the two methods this reads, and only the fields it uses: the full index
// interface drags in the whole Operation variant to count rows.
const indexIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
  const Tokens = IDL.Record({ e8s: IDL.Nat64 })
  const Operation = IDL.Variant({
    Approve: IDL.Record({
      fee: Tokens,
      from: IDL.Text,
      allowance: Tokens,
      expires_at: IDL.Opt(TimeStamp),
      spender: IDL.Text,
      expected_allowance: IDL.Opt(Tokens),
    }),
    Burn: IDL.Record({ from: IDL.Text, amount: Tokens, spender: IDL.Opt(IDL.Text) }),
    Mint: IDL.Record({ to: IDL.Text, amount: Tokens }),
    Transfer: IDL.Record({
      to: IDL.Text,
      fee: Tokens,
      from: IDL.Text,
      amount: Tokens,
      spender: IDL.Opt(IDL.Text),
    }),
  })
  const Transaction = IDL.Record({
    memo: IDL.Nat64,
    icrc1_memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    operation: Operation,
    created_at_time: IDL.Opt(TimeStamp),
    timestamp: IDL.Opt(TimeStamp),
  })
  const TransactionWithId = IDL.Record({ id: IDL.Nat64, transaction: Transaction })
  const Response = IDL.Record({
    balance: IDL.Nat64,
    transactions: IDL.Vec(TransactionWithId),
    oldest_tx_id: IDL.Opt(IDL.Nat64),
  })

  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat64], ["query"]),
    get_account_transactions: IDL.Func(
      [IDL.Record({ account: Account, start: IDL.Opt(IDL.Nat), max_results: IDL.Nat })],
      [IDL.Variant({ Ok: Response, Err: IDL.Record({ message: IDL.Text }) })],
      ["query"]
    ),
  })
}

type IndexActor = {
  icrc1_balance_of: (a: { owner: Principal; subaccount: [] | [Uint8Array] }) => Promise<bigint>
  get_account_transactions: (a: {
    account: { owner: Principal; subaccount: [] | [Uint8Array] }
    start: [] | [bigint]
    max_results: bigint
  }) => Promise<
    | { Ok: { balance: bigint; transactions: { id: bigint }[]; oldest_tx_id: [] | [bigint] } }
    | { Err: { message: string } }
  >
}

// One page is enough to date the account and count its recent activity, and a
// full history walk would be dozens of calls for a number nobody reads exactly.
const PAGE = 100n

export async function fetchAccountStats(
  owner: string,
  subaccount: Uint8Array | undefined,
  identity?: Identity
): Promise<AccountStats> {
  const agent = await createAgent(identity)
  const index = Actor.createActor<IndexActor>(indexIdl, { agent, canisterId: ICP_INDEX_ID })
  const account = {
    owner: Principal.fromText(owner),
    subaccount: (subaccount ? [subaccount] : []) as [] | [Uint8Array],
  }

  const page = await index.get_account_transactions({ account, start: [], max_results: PAGE })
  if ("Err" in page) {
    // The index lags the ledger and rejects accounts it has not indexed yet, so
    // the balance is still worth reporting on its own.
    return { balance: await index.icrc1_balance_of(account), txCount: 0 }
  }

  const { balance, transactions, oldest_tx_id } = page.Ok
  const oldest = oldest_tx_id[0]
  const newest = transactions[0]?.id

  return {
    balance,
    txCount: transactions.length,
    firstBlock: oldest,
    lastBlock: newest,
  }
}
