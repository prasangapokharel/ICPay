import type { Identity } from "@icp-sdk/core/agent"
import { fromNullable } from "@dfinity/utils"
import { IcrcTransferError } from "@icp-sdk/canisters/ledger/icrc"
import type { Principal } from "@icp-sdk/core/principal"
import type { Outcome } from "@/services/client"
import { icrcLedger } from "@/services/ledger/icrc"
import { custodialSubaccount, isLedgerSupported } from "@/services/tokens"

export type SweepResult = { blockIndex: bigint; amount: bigint }

type TransferError = {
  BadFee?: { expected_fee: bigint }
  BadBurn?: { min_burn_amount: bigint }
  InsufficientFunds?: { balance: bigint }
  TooOld?: null
  CreatedInFuture?: { ledger_time: bigint }
  Duplicate?: { duplicate_of: bigint }
  TemporarilyUnavailable?: null
  GenericError?: { error_code: bigint; message: string }
}

function describe(err: TransferError): string {
  if (err.InsufficientFunds) return "Not enough balance to cover the amount and the fee."
  if (err.BadFee) return `The ledger expected a fee of ${err.BadFee.expected_fee}.`
  if (err.BadBurn) return `Below the minimum burn amount of ${err.BadBurn.min_burn_amount}.`
  if (err.TooOld) return "The request expired before the ledger saw it. Try again."
  if (err.CreatedInFuture) return "This device's clock is ahead of the ledger. Try again."
  if (err.TemporarilyUnavailable) return "The ledger is temporarily unavailable. Try again."
  if (err.GenericError) return err.GenericError.message
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

  if (!(await isLedgerSupported(identity, ledgerId))) {
    return { err: "This token cannot be moved into ICPay." }
  }

  try {
    const ledger = await icrcLedger(identity, ledgerId)
    const blockIndex = await ledger.transfer({
      to: {
        owner: custodian,
        subaccount: [custodialSubaccount(identity.getPrincipal())],
      },
      amount,
      created_at_time: BigInt(Date.now()) * 1_000_000n,
    })
    return { ok: { blockIndex, amount } }
  } catch (e) {
    if (e instanceof IcrcTransferError) {
      const err = e.errorType as TransferError
      if (err.Duplicate) {
        return { ok: { blockIndex: err.Duplicate.duplicate_of, amount } }
      }
      return { err: describe(err) }
    }
    console.error(e)
    return { err: "Could not reach the ledger. Nothing was sent." }
  }
}
