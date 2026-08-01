import { formatAmount } from "@/lib/wallet-utils"

export type Receipt = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
}

const WIDTH = 1080
const HEIGHT = 1350

// Memos are free text and a recipient can be a raw principal, so every
// interpolated value is escaped before it reaches the SVG. Without this a memo
// containing "</text>" would break out of the node and could inject markup into
// the document we rasterise.
function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "&": return "&amp;"
      case '"': return "&quot;"
      default: return "&apos;"
    }
  })
}

// Long principals would overflow the card, so they are middle-truncated the same
// way the success screen shows them.
function shortenRecipient(recipient: string): string {
  if (recipient.startsWith("@")) {
    return recipient.length > 24 ? `${recipient.slice(0, 23)}…` : recipient
  }
  return recipient.length > 20 ? `${recipient.slice(0, 8)}…${recipient.slice(-6)}` : recipient
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

export function receiptSvg({ amount, recipient, blockIndex, memo }: Receipt): string {
  const to = escapeXml(shortenRecipient(recipient))
  // formatAmount, not formatE8s: the latter pads to all 8 decimals, so 1.5 ICP
  // would read "1.50000000" across the widest line on the card.
  const value = escapeXml(formatAmount(amount))
  const block = escapeXml(blockIndex.toString())
  const note = memo?.trim() ? escapeXml(truncate(memo.trim(), 40)) : null
  // SendSuccess also covers withdrawals to one's own account, where "tip" would
  // be wrong. A handle recipient is the only case that is unambiguously a tip.
  const heading = recipient.startsWith("@") ? "TIP SENT" : "SENT"
  // A large balance ("12,345.6789") is more than twice the width of "1.5" and
  // would run past the card edge at the base size, so the figure is stepped down
  // instead of clipped.
  const valueSize = value.length > 13 ? 84 : value.length > 9 ? 108 : 132

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="80" y="150" width="920" height="1050" rx="56" fill="#141414" stroke="#262626" stroke-width="2"/>

  <text x="540" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="500" fill="#8a8a8a" text-anchor="middle" letter-spacing="6">${heading}</text>

  <text x="540" y="530" font-family="system-ui, -apple-system, sans-serif" font-size="${valueSize}" font-weight="700" fill="#ffffff" text-anchor="middle">${value}</text>
  <text x="540" y="605" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="600" fill="#e0447c" text-anchor="middle" letter-spacing="4">ICP</text>

  <line x1="180" y1="700" x2="900" y2="700" stroke="#262626" stroke-width="2" stroke-dasharray="12 12"/>

  <text x="540" y="790" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#8a8a8a" text-anchor="middle">to</text>
  <text x="540" y="860" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="600" fill="#ffffff" text-anchor="middle">${to}</text>
${note ? `  <text x="540" y="955" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-style="italic" fill="#b0b0b0" text-anchor="middle">&#8220;${note}&#8221;</text>` : ""}

  <text x="540" y="1085" font-family="ui-monospace, monospace" font-size="26" fill="#6a6a6a" text-anchor="middle">BLOCK ${block}</text>
  <text x="540" y="1140" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="600" fill="#8a8a8a" text-anchor="middle">ICPay &#183; on the Internet Computer</text>
</svg>`
}

// Rasterised through an Image rather than drawn with canvas text calls so the
// layout above stays the single source of truth. The blob URL is revoked on both
// paths; leaking it would pin the decoded bitmap for the page's lifetime.
export async function receiptPng(receipt: Receipt): Promise<Blob> {
  const svg = receiptSvg(receipt)
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))

  try {
    const img = new Image()
    img.decoding = "sync"
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to render receipt"))
      img.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable")
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode receipt"))),
        "image/png"
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function receiptFilename(blockIndex: bigint): string {
  return `icpay-receipt-${blockIndex}.png`
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled"

// Share sheet where available, download otherwise. canShare is checked with the
// actual file because iOS Safari advertises navigator.share but rejects file
// payloads, which would otherwise throw after the user had already tapped.
export async function shareReceipt(receipt: Receipt): Promise<ShareOutcome> {
  const blob = await receiptPng(receipt)
  const filename = receiptFilename(receipt.blockIndex)
  const file = new File([blob], filename, { type: "image/png" })

  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return "shared"
    } catch (e) {
      // Dismissing the share sheet rejects with AbortError. That is a
      // deliberate choice, not a failure, so it must not fall through to a
      // surprise download.
      if (e instanceof Error && e.name === "AbortError") return "cancelled"
      triggerDownload(blob, filename)
      return "downloaded"
    }
  }

  triggerDownload(blob, filename)
  return "downloaded"
}
