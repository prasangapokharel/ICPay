export function canisterDashboardUrl(canisterId: string): string {
  return `https://dashboard.internetcomputer.org/canister/${canisterId}`
}

export function looksLikeCanisterId(value: string): boolean {
  return value.endsWith("-cai") && value.includes("-")
}
