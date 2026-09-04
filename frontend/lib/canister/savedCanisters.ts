const STORAGE_PREFIX = "icpay:canisters:"
const MAX_SAVED = 24

function keyFor(principal: string): string {
  return `${STORAGE_PREFIX}${principal}`
}

function readRaw(principal: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(keyFor(principal))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0)
  } catch {
    return []
  }
}

function writeRaw(principal: string, ids: string[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(keyFor(principal), JSON.stringify(ids.slice(0, MAX_SAVED)))
}

/** Canisters this II created or recently used in ICPay (browser-local). */
export function listSavedCanisters(principal: string): string[] {
  if (!principal) return []
  return readRaw(principal)
}

export function rememberCanister(principal: string, canisterId: string): void {
  const id = canisterId.trim()
  if (!principal || !id) return
  const next = [id, ...readRaw(principal).filter((x) => x !== id)]
  writeRaw(principal, next)
}

export function shortCanisterId(id: string): string {
  const text = id.trim()
  if (text.length <= 18) return text
  return `${text.slice(0, 5)}…${text.slice(-7)}`
}
