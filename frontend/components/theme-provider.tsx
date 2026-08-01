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
      defaultTheme="system"
      enableSystem
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

// Hex, not var(--background): those tokens are oklch(), and theme-color is
// parsed by the browser chrome rather than the CSS engine. Kept in sync with
// --background in globals.css.
const THEME_COLOR = { light: "#ffffff", dark: "#252525" } as const

// Runs before paint so the status bar never flashes the wrong shade. Reads the
// same localStorage key next-themes writes, falling back to the OS preference
// only when the user has not chosen explicitly.
const themeColorScript = `(function(){try{
var t=localStorage.getItem('theme');
var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);
var m=document.createElement('meta');
m.name='theme-color';m.content=d?'${THEME_COLOR.dark}':'${THEME_COLOR.light}';
document.head.appendChild(m);
}catch(e){}})()`

export function ThemeColorScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeColorScript }} />
}

function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return
    // Safari paints the area above the viewport (notch, status bar, rubber-band
    // overscroll) with theme-color, not with the page background, so it stays
    // the wrong shade unless this follows the class toggle.
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
