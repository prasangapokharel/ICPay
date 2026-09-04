/** Bytes → human size for canister memory metrics. */
export function formatBytes(bytes: bigint): string {
  if (bytes <= 0n) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"] as const
  let value = Number(bytes)
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  const text =
    i === 0
      ? String(Math.round(value))
      : value >= 100
        ? value.toFixed(0)
        : value >= 10
          ? value.toFixed(1).replace(/\.0$/, "")
          : value.toFixed(2).replace(/\.?0+$/, "")
  return `${text} ${units[i]}`
}

export function formatModuleHash(hash: Uint8Array | undefined | null): string {
  if (!hash || hash.length === 0) return "—"
  const hex = Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  if (hex.length <= 16) return hex
  return `${hex.slice(0, 8)}…${hex.slice(-8)}`
}

export type CanisterRunStatus = "running" | "stopping" | "stopped"

export function parseRunStatus(
  status: { running: null } | { stopping: null } | { stopped: null }
): CanisterRunStatus {
  if ("running" in status) return "running"
  if ("stopping" in status) return "stopping"
  return "stopped"
}

/** Parse "1.5" as trillion cycles (1.5 × 10¹²). */
export function parseCyclesT(text: string): bigint | null {
  const raw = text.trim().replace(/,/g, "")
  if (!raw || !/^\d+(\.\d+)?$/.test(raw)) return null
  const [wholePart, fracPart = ""] = raw.split(".")
  const whole = BigInt(wholePart || "0")
  const fracPadded = (fracPart + "000000000000").slice(0, 12)
  return whole * 1_000_000_000_000n + BigInt(fracPadded)
}

export function formatNsTimestamp(ns: bigint): string {
  if (ns <= 0n) return "—"
  const ms = Number(ns / 1_000_000n)
  if (!Number.isFinite(ms)) return "—"
  return new Date(ms).toLocaleString()
}
