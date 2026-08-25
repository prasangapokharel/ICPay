const URL_RE = /https?:\/\/[^\s<>\]]+/gi

export function findMessageSourceUrl(text: string): string | null {
  const match = URL_RE.exec(text)
  if (!match) return null
  return match[0].replace(/[.,;:!?)]+$/, "")
}

export function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function sourceFaviconUrl(url: string, size = 32): string {
  const host = sourceHostname(url)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`
}
