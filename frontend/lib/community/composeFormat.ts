export type TextEdit = {
  value: string
  selectionStart: number
  selectionEnd: number
}

export function wrapMarkers(
  value: string,
  start: number,
  end: number,
  open: string,
  close: string,
  placeholder = "text"
): TextEdit {
  const selected = value.slice(start, end) || placeholder
  const next = `${value.slice(0, start)}${open}${selected}${close}${value.slice(end)}`
  const selectionStart = start + open.length
  const selectionEnd = selectionStart + selected.length
  return { value: next, selectionStart, selectionEnd }
}

export function prefixQuoteLines(
  value: string,
  start: number,
  end: number,
  placeholder = "quote"
): TextEdit {
  const selected = value.slice(start, end) || placeholder
  const quoted = selected
    .split("\n")
    .map((line) => (line.startsWith("> ") ? line : `> ${line}`))
    .join("\n")
  const next = `${value.slice(0, start)}${quoted}${value.slice(end)}`
  return { value: next, selectionStart: start, selectionEnd: start + quoted.length }
}

export function insertLink(
  value: string,
  start: number,
  end: number,
  placeholder = "link"
): TextEdit {
  const selected = value.slice(start, end) || placeholder
  const wrapped = `[${selected}](https://)`
  const next = `${value.slice(0, start)}${wrapped}${value.slice(end)}`
  const urlStart = start + selected.length + 3
  const urlEnd = urlStart + 8
  return { value: next, selectionStart: urlStart, selectionEnd: urlEnd }
}

export function insertDateStamp(value: string, start: number, end: number): TextEdit {
  const stamp = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())
  const next = `${value.slice(0, start)}${stamp}${value.slice(end)}`
  const selectionEnd = start + stamp.length
  return { value: next, selectionStart: selectionEnd, selectionEnd }
}

const MARKER_PATTERNS = [
  /\|\|([^|]+)\|\|/g,
  /`([^`]+)`/g,
  /\[([^\]]+)\]\([^)]+\)/g,
  /\*([^*]+)\*/g,
  /__([^_]+)__/g,
  /_([^_]+)_/g,
  /~([^~]+)~/g,
  /^>\s?/gm,
]

export function stripTelegramMarkers(text: string): string {
  let out = text
  for (const pattern of MARKER_PATTERNS) {
    out = out.replace(pattern, (_, inner?: string) => inner ?? "")
  }
  return out
}

export function clearFormatting(value: string, start: number, end: number): TextEdit {
  const selected = value.slice(start, end)
  const stripped = stripTelegramMarkers(selected)
  const next = `${value.slice(0, start)}${stripped}${value.slice(end)}`
  return { value: next, selectionStart: start, selectionEnd: start + stripped.length }
}

export function applyTextEdit(textarea: HTMLTextAreaElement, edit: TextEdit) {
  textarea.value = edit.value
  textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd)
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
  textarea.focus()
}
