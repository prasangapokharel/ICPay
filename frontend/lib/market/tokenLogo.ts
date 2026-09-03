const remembered = new Map<string, string>()

export function usableTokenLogo(src?: string | null): string | null {
  if (!src) return null
  const value = src.trim()
  if (value.startsWith("data:image")) return value
  if (value.startsWith("https://")) return value
  return null
}

export function rememberTokenLogo(ledgerId: string, src?: string | null) {
  const url = usableTokenLogo(src)
  if (url) remembered.set(ledgerId, url)
}

export function rememberedTokenLogo(ledgerId: string): string | null {
  return remembered.get(ledgerId) ?? null
}
