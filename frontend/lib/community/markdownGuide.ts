export const MARKDOWN_SYNTAX_ROWS = [
  { syntax: "*text*", labelKey: "formatBold" },
  { syntax: "_text_", labelKey: "formatItalic" },
  { syntax: "__text__", labelKey: "formatUnderline" },
  { syntax: "~text~", labelKey: "formatStrike" },
  { syntax: "`text`", labelKey: "formatMono" },
  { syntax: "||text||", labelKey: "formatSpoiler" },
  { syntax: "> line", labelKey: "formatQuote" },
  { syntax: "[label](url)", labelKey: "formatLink" },
] as const

export const MARKDOWN_EXAMPLE_TEMPLATE = `*Your headline here*

_Source · Jan 1, 2026_

Short lead paragraph. State the main news in plain language.

*Key points*
- First detail readers should know
- Second detail
- Third detail

[Read the full story](https://example.com)`
