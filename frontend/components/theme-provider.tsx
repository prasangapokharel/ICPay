"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

// Hex rather than var(--background): theme-color is read by the browser chrome,
// not the CSS engine, so it cannot resolve an oklch() custom property. These are
// the sRGB equivalents of --background in globals.css (oklch(1 0 0) and
// oklch(0.145 0 0)) and must be updated alongside it.
const THEME_COLOR = { light: "#ffffff", dark: "#0a0a0a" } as const

// Runs before paint so the status bar never flashes the wrong shade.
const themeColorScript = `(function(){try{
var d=localStorage.getItem('theme')!=='light';
var m=document.createElement('meta');
m.name='theme-color';m.content=d?'${THEME_COLOR.dark}':'${THEME_COLOR.light}';
document.head.appendChild(m);
}catch(e){}})()`

export function ThemeColorScript() {
  return (
    <template dangerouslySetInnerHTML={{ __html: `<script>${themeColorScript}</script>` }} />
  )
}

function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return
    // Safari paints the area above the viewport (notch, status bar, overscroll)
    // with theme-color rather than the page background, so it stays the wrong
    // shade unless this follows the class toggle.
    const color = resolvedTheme === "dark" ? THEME_COLOR.dark : THEME_COLOR.light
    const existing = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )
    // Any tag beyond the first is a media-scoped leftover that would still win
    // when the OS preference disagrees with the app theme.
    existing.forEach((m, i) => {
      if (i > 0) m.remove()
    })
    let meta = existing[0]
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "theme-color"
      document.head.appendChild(meta)
    }
    meta.removeAttribute("media")
    if (meta.content !== color) meta.content = color
  }, [resolvedTheme])

  return null
}

export { ThemeProvider }
