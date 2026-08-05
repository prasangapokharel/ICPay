import { Actor, type Identity } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"
import type { Outcome } from "@/services/client"
import { custodialSubaccount, PINNED_LEDGER_IDS } from "@/services/tokens"

export type SweepResult = { blockIndex: bigint; amount: bigint }

type TransferError =
  | { BadFee: { expected_fee: bigint } }
  | { BadBurn: { min_burn_amount: bigint } }
  | { InsufficientFunds: { balance: bigint } }
  | { TooOld: null }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { TemporarilyUnavailable: null }
  | { GenericError: { error_code: bigint; message: string } }

type TransferResult = { Ok: bigint } | { Err: TransferError }

// Only icrc1_transfer: the balance and metadata calls live in services/tokens.
const transferIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const TransferArgs = IDL.Record({
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    to: Account,
    amount: IDL.Nat,
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
  })
  const TransferError = IDL.Variant({
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
    TooOld: IDL.Null,
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    TemporarilyUnavailable: IDL.Null,
    GenericError: IDL.Record({ error_code: IDL.Nat, message: IDL.Text }),
  })
  return IDL.Service({
    icrc1_transfer: IDL.Func(
      [TransferArgs],
      [IDL.Variant({ Ok: IDL.Nat, Err: TransferError })],
      []
    ),
  })
}

function describe(err: TransferError): string {
  if ("InsufficientFunds" in err) return "Not enough balance to cover the amount and the fee."
  if ("BadFee" in err) return `The ledger expected a fee of ${err.BadFee.expected_fee}.`
  if ("BadBurn" in err) return `Below the minimum burn amount of ${err.BadBurn.min_burn_amount}.`
  if ("TooOld" in err) return "The request expired before the ledger saw it. Try again."
  if ("CreatedInFuture" in err) return "This device's clock is ahead of the ledger. Try again."
  if ("TemporarilyUnavailable" in err) return "The ledger is temporarily unavailable. Try again."
  if ("GenericError" in err) return err.GenericError.message
  return "The transfer was rejected."
}

/**
 * Moves funds sitting at the user's own principal into their ICPay custodial
 * subaccount, signed by the browser identity. Nothing is stored: Internet
 * Identity issues an unscoped delegation, so the same identity that signs into
 * the wallet can sign a ledger transfer as its own owner.
 */
export async function sweepToCustody(
  identity: Identity | undefined,
  ledgerId: string,
  custodian: Principal,
  amount: bigint
): Promise<Outcome<SweepResult>> {
  if (!identity) return { err: "Not authenticated" }
  if (amount <= 0n) return { err: "Nothing to move." }

  // A ledger outside the canister's allowlist would take the funds into custody
  // and then refuse to transfer or withdraw them, so they would be stranded.
  // The pinned set is the set verified supported by isLedgerSupported.
  if (!PINNED_LEDGER_IDS.includes(ledgerId)) {
    return { err: "This token cannot be moved into ICPay." }
  }

  try {
    const agent = await createAgent(identity)
    const ledger = Actor.createActor<{
      icrc1_transfer: (a: unknown) => Promise<TransferResult>
    }>(transferIdl, { agent, canisterId: ledgerId })

    const result = await ledger.icrc1_transfer({
      from_subaccount: [],
      to: {
        owner: custodian,
        subaccount: [Array.from(custodialSubaccount(identity.getPrincipal()))],
      },
      amount,
      // No fee: the ledger applies its current one. Passing a cached metadata fee
      // that has since changed would fail as #BadFee instead of just working.
      fee: [],
      memo: [],
      // Opts into the ledger's 24h deduplication window, so a retry after a lost
      // response is recognised as the same transfer rather than sent twice.
      created_at_time: [BigInt(Date.now()) * 1_000_000n],
    })

    if ("Ok" in result) return { ok: { blockIndex: result.Ok, amount } }

    // The funds already moved on a previous attempt whose response was lost;
    // reporting an error here would claim a completed transfer had failed.
    if ("Duplicate" in result.Err) {
      return { ok: { blockIndex: result.Err.Duplicate.duplicate_of, amount } }
    }

    return { err: describe(result.Err) }
  } catch (e) {
    console.error(e)
    return { err: "Could not reach the ledger. Nothing was sent." }
  }
}
