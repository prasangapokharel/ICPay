export type SavedCanister = {
  id: string
  name: string
}

const STORAGE_PREFIX = "icpay:canisters:"
const MAX_SAVED = 64

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function keyFor(principal: string): string {
  return `${STORAGE_PREFIX}${principal}`
}

function parseEntry(raw: unknown): SavedCanister | null {
  if (typeof raw === "string" && raw.trim()) {
    return { id: raw.trim(), name: "" }
  }
  if (raw && typeof raw === "object" && "id" in raw) {
    const obj = raw as { id?: unknown; name?: unknown }
    const id = typeof obj.id === "string" ? obj.id.trim() : ""
    if (!id) return null
    const name = typeof obj.name === "string" ? obj.name.trim() : ""
    return { id, name }
  }
  return null
}

function readEntries(principal: string): SavedCanister[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(keyFor(principal))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: SavedCanister[] = []
    const seen = new Set<string>()
    for (const item of parsed) {
      const entry = parseEntry(item)
      if (!entry || seen.has(entry.id)) continue
      seen.add(entry.id)
      out.push(entry)
    }
    return out
  } catch {
    return []
  }
}

function writeEntries(principal: string, entries: SavedCanister[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(
    keyFor(principal),
    JSON.stringify(
      entries.slice(0, MAX_SAVED).map((e) => (e.name ? { id: e.id, name: e.name } : e.id))
    )
  )
  emit()
}

export function subscribeSavedCanisters(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Canisters this II created or tracked in ICPay (browser-local). */
export function listSavedCanisters(principal: string): string[] {
  return listSavedCanisterEntries(principal).map((e) => e.id)
}

export function listSavedCanisterEntries(principal: string): SavedCanister[] {
  if (!principal) return []
  return readEntries(principal)
}

export function getSavedCanisterName(principal: string, canisterId: string): string {
  const id = canisterId.trim()
  if (!principal || !id) return ""
  return readEntries(principal).find((e) => e.id === id)?.name ?? ""
}

export function rememberCanister(
  principal: string,
  canisterId: string,
  name?: string | null
): void {
  const id = canisterId.trim()
  if (!principal || !id) return
  const label = typeof name === "string" ? name.trim() : ""
  const prev = readEntries(principal)
  const existing = prev.find((e) => e.id === id)
  const nextName = label || existing?.name || ""
  const next = [{ id, name: nextName }, ...prev.filter((e) => e.id !== id)]
  writeEntries(principal, next)
}

export function forgetCanister(principal: string, canisterId: string): void {
  const id = canisterId.trim()
  if (!principal || !id) return
  writeEntries(
    principal,
    readEntries(principal).filter((e) => e.id !== id)
  )
}

export function shortCanisterId(id: string): string {
  const text = id.trim()
  if (text.length <= 18) return text
  return `${text.slice(0, 5)}…${text.slice(-7)}`
}

export function displayCanisterLabel(entry: SavedCanister): string {
  return entry.name.trim() || shortCanisterId(entry.id)
}
