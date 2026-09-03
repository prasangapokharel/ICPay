export function showWalletLine(wallet: bigint): boolean {
  return wallet > 0n
}

export function tradeCta(authLoading: boolean, isAuthenticated: boolean): "wait" | "sign_in" | "trade" {
  if (authLoading) return "wait"
  if (!isAuthenticated) return "sign_in"
  return "trade"
}
