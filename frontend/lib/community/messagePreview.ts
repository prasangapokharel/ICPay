export const MESSAGE_COLLAPSE_CHARS = 320
export const MESSAGE_COLLAPSE_LINES = 8

export function isLongMessage(text: string): boolean {
  if (text.length > MESSAGE_COLLAPSE_CHARS) return true
  return text.split("\n").length > MESSAGE_COLLAPSE_LINES
}

export function truncateMessagePreview(text: string): { preview: string; truncated: boolean } {
  if (!isLongMessage(text)) return { preview: text, truncated: false }

  const lines = text.split("\n")
  if (lines.length > MESSAGE_COLLAPSE_LINES) {
    return {
      preview: lines.slice(0, MESSAGE_COLLAPSE_LINES).join("\n").trimEnd(),
      truncated: true,
    }
  }

  let end = MESSAGE_COLLAPSE_CHARS
  while (end > 0 && end < text.length && !/\s/.test(text[end])) end--
  if (end <= 0) end = MESSAGE_COLLAPSE_CHARS

  return { preview: text.slice(0, end).trimEnd(), truncated: true }
}
