import { IDL } from "@icp-sdk/core/candid"

export const tradeIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })

  const OrderStatus = IDL.Variant({
    Open: IDL.Null,
    Filled: IDL.Null,
    Cancelled: IDL.Null,
  })

  const LimitOrder = IDL.Record({
    id: IDL.Nat64,
    user: IDL.Principal,
    token_in: IDL.Text,
    token_out: IDL.Text,
    amount_in: IDL.Nat,
    min_amount_out: IDL.Nat,
    created_at_ns: IDL.Nat64,
    filled_at_ns: IDL.Opt(IDL.Nat64),
    status: OrderStatus,
  })

  const TradeRecord = IDL.Record({
    service_fee: IDL.Nat,
    tx_id: IDL.Text,
    timestamp_ns: IDL.Nat64,
    token_in: IDL.Text,
    amount_out: IDL.Nat,
    amount_in: IDL.Nat,
    token_out: IDL.Text,
  })

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

  const ApiResultNat = IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })
  const ApiResultSwap = IDL.Variant({ Ok: SwapResult, Err: IDL.Text })
  const ApiResultQuote = IDL.Variant({ Ok: SwapQuoteResult, Err: IDL.Text })
  const ApiResultLimitOrder = IDL.Variant({ Ok: LimitOrder, Err: IDL.Text })
  const ResultUnit = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })

  return IDL.Service({
    cancel_limit_order: IDL.Func([IDL.Nat64], [ApiResultNat], []),
    credit_from_wallet: IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Nat, IDL.Nat64],
      [ResultUnit],
      []
    ),
    debit_to_wallet: IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Nat, Account],
      [ApiResultNat],
      []
    ),
    execute_swap: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
      [ApiResultSwap],
      []
    ),
    execute_swap_for_user: IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
      [ApiResultSwap],
      []
    ),
    get_open_limit_orders: IDL.Func(
      [IDL.Opt(IDL.Principal)],
      [IDL.Vec(LimitOrder)],
      ["query"]
    ),
    get_swap_quote: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [ApiResultQuote], ["query"]),
    get_trading_balance: IDL.Func([IDL.Principal, IDL.Text], [IDL.Nat], ["query"]),
    get_treasury: IDL.Func([], [IDL.Principal], ["query"]),
    get_user_limit_orders: IDL.Func(
      [IDL.Principal, IDL.Opt(IDL.Nat64)],
      [IDL.Vec(LimitOrder)],
      ["query"]
    ),
    get_user_trades: IDL.Func(
      [IDL.Principal, IDL.Opt(IDL.Nat64)],
      [IDL.Vec(TradeRecord)],
      ["query"]
    ),
    health: IDL.Func([], [IDL.Text], ["query"]),
    place_limit_order: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
      [ApiResultLimitOrder],
      []
    ),
    sweep_fees: IDL.Func([IDL.Text], [ApiResultNat], []),
  })
}
