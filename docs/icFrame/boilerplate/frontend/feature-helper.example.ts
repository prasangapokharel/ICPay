// frontend/lib/feature/formatName.ts
// Pure helpers — no React, no canister, no fetch.

export function formatFeatureName(name: string): string {
  return name.trim().toLowerCase()
}

export function isValidFeatureName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 32
}
