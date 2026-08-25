export const CMC_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai"

export const CKBTC_LEDGER_ID = "mxzaz-hqaaa-aaaar-qaada-cai"
export const CKBTC_MINTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai"

export const CKETH_LEDGER_ID = "ss2fx-dyaaa-aaaar-qacoq-cai"
export const CKETH_MINTER_ID = "sv3dd-oaaaa-aaaar-qacoa-cai"

const CYCLES_PER_XDR = 1_000_000_000_000n

export function icpUsdFromCyclesRate(cyclesPerIcp: bigint, xdrUsd: number): number {
  const icpXdr = Number(cyclesPerIcp) / Number(CYCLES_PER_XDR)
  return icpXdr * xdrUsd
}
