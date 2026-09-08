import { IDL } from "@icp-sdk/core/candid"

export const tradeIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const SwapQuoteResult = IDL.Record({
    amount_after_fee: IDL.Nat,
    service_fee: IDL.Nat,
    amount_out_raw: IDL.Nat,
    amount_out: IDL.Nat,
    swap_fee: IDL.Nat,
    price_impact: IDL.Text,
    pool_id: IDL.Principal,
  })

  const SwapResult = IDL.Record({
    service_fee: IDL.Nat,
    tx_id: IDL.Text,
    block_index: IDL.Nat64,
    amount_out: IDL.Nat,
    amount_in: IDL.Nat,
  })

  const ApiResultQuote = IDL.Variant({ Ok: SwapQuoteResult, Err: IDL.Text })
  const ApiResultSwap = IDL.Variant({ Ok: SwapResult, Err: IDL.Text })
  const ApiResultUnit = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })
  const ApiResultNat = IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })

  return IDL.Service({
    credit_from_wallet: IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Nat, IDL.Nat64],
      [ApiResultUnit],
      []
    ),
    debit_to_wallet: IDL.Func([IDL.Principal, IDL.Text, IDL.Nat], [ApiResultNat], []),
    execute_swap: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
      [ApiResultSwap],
      []
    ),
    get_swap_quote: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [ApiResultQuote], ["query"]),
    get_trading_balance: IDL.Func([IDL.Principal, IDL.Text], [IDL.Nat], ["query"]),
    health: IDL.Func([], [IDL.Text], ["query"]),
  })
}
