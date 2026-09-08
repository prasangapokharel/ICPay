export function channelMessagePath(slug: string, messageId: bigint | string | number): string {
  return `/channels/${encodeURIComponent(slug)}/${messageId.toString()}`
}

export function channelMessageUrl(
  slug: string,
  messageId: bigint | string | number,
  origin?: string
): string {
  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"))
  return `${base}${channelMessagePath(slug, messageId)}`
}

export function parseChannelMessageId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) return null
  try {
    return BigInt(raw)
  } catch {
    return null
  }
}
