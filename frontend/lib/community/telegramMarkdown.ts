export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "bold"; children: InlineNode[] }
  | { kind: "italic"; children: InlineNode[] }
  | { kind: "underline"; children: InlineNode[] }
  | { kind: "strike"; children: InlineNode[] }
  | { kind: "spoiler"; children: InlineNode[] }
  | { kind: "code"; value: string }
  | { kind: "link"; href: string; children: InlineNode[] }

export type BlockNode =
  | { kind: "line"; quote: boolean; children: InlineNode[] }
  | { kind: "pre"; value: string }

const URL_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)]|www\.[^\s<]+[^\s<.,;:!?)]/gi

type MarkerRule = {
  kind: "bold" | "italic" | "underline" | "strike" | "spoiler" | "code"
  open: string
  close: string
  nested?: boolean
}

const INLINE_MARKERS: MarkerRule[] = [
  { kind: "spoiler", open: "||", close: "||", nested: true },
  { kind: "code", open: "`", close: "`" },
  { kind: "underline", open: "__", close: "__", nested: true },
  { kind: "bold", open: "*", close: "*", nested: true },
  { kind: "italic", open: "_", close: "_", nested: true },
  { kind: "strike", open: "~", close: "~", nested: true },
]

function parseLink(text: string, index: number): { node: InlineNode; next: number } | null {
  if (text[index] !== "[") return null
  const labelEnd = text.indexOf("]", index + 1)
  if (labelEnd === -1) return null
  if (text[labelEnd + 1] !== "(") return null
  const hrefEnd = text.indexOf(")", labelEnd + 2)
  if (hrefEnd === -1) return null
  const label = text.slice(index + 1, labelEnd)
  const href = text.slice(labelEnd + 2, hrefEnd)
  return {
    node: { kind: "link", href, children: parseInline(label) },
    next: hrefEnd + 1,
  }
}

function parseMarker(
  text: string,
  index: number,
  rule: MarkerRule
): { node: InlineNode; next: number } | null {
  if (!text.startsWith(rule.open, index)) return null
  const contentStart = index + rule.open.length
  const closeAt = text.indexOf(rule.close, contentStart)
  if (closeAt === -1) return null
  const inner = text.slice(contentStart, closeAt)
  const children = rule.nested ? parseInline(inner) : [{ kind: "text" as const, value: inner }]
  switch (rule.kind) {
    case "bold":
      return { node: { kind: "bold", children }, next: closeAt + rule.close.length }
    case "italic":
      return { node: { kind: "italic", children }, next: closeAt + rule.close.length }
    case "underline":
      return { node: { kind: "underline", children }, next: closeAt + rule.close.length }
    case "strike":
      return { node: { kind: "strike", children }, next: closeAt + rule.close.length }
    case "spoiler":
      return { node: { kind: "spoiler", children }, next: closeAt + rule.close.length }
    default:
      return { node: { kind: "code", value: inner }, next: closeAt + rule.close.length }
  }
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let i = 0

  while (i < text.length) {
    const link = parseLink(text, i)
    if (link) {
      nodes.push(link.node)
      i = link.next
      continue
    }

    let matched = false
    for (const rule of INLINE_MARKERS) {
      const hit = parseMarker(text, i, rule)
      if (hit) {
        nodes.push(hit.node)
        i = hit.next
        matched = true
        break
      }
    }
    if (matched) continue

    const urlRe = new RegExp(URL_RE.source, URL_RE.flags)
    urlRe.lastIndex = i
    const urlMatch = urlRe.exec(text)
    if (urlMatch && urlMatch.index === i) {
      const label = urlMatch[0]
      const href = label.startsWith("www.") ? `https://${label}` : label
      nodes.push({ kind: "link", href, children: [{ kind: "text", value: label }] })
      i += label.length
      continue
    }

    let next = i + 1
    while (next < text.length) {
      if (text[next] === "[" || text[next] === "*" || text[next] === "_" || text[next] === "~" || text[next] === "`" || text[next] === "|") {
        break
      }
      urlRe.lastIndex = next
      const aheadUrl = urlRe.exec(text)
      if (aheadUrl && aheadUrl.index === next) break
      if (text.startsWith("__", next) || text.startsWith("||", next)) break
      next++
    }

    nodes.push({ kind: "text", value: text.slice(i, next) })
    i = next
  }

  return nodes
}

export function parseTelegramMessage(text: string): BlockNode[] {
  const blocks: BlockNode[] = []
  let i = 0

  while (i < text.length) {
    if (text.startsWith("```", i)) {
      const close = text.indexOf("```", i + 3)
      if (close !== -1) {
        blocks.push({ kind: "pre", value: text.slice(i + 3, close) })
        i = close + 3
        if (text[i] === "\n") i++
        continue
      }
    }

    let lineEnd = text.indexOf("\n", i)
    if (lineEnd === -1) lineEnd = text.length
    const rawLine = text.slice(i, lineEnd)
    const quote = rawLine.startsWith("> ")
    const line = quote ? rawLine.slice(2) : rawLine
    blocks.push({ kind: "line", quote, children: parseInline(line) })
    i = lineEnd < text.length ? lineEnd + 1 : lineEnd
  }

  if (blocks.length === 0) {
    blocks.push({ kind: "line", quote: false, children: [] })
  }

  return blocks
}
