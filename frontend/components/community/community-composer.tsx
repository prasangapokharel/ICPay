"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  applyTextEdit,
  clearFormatting,
  insertDateStamp,
  insertLink,
  prefixQuoteLines,
  wrapMarkers,
} from "@/lib/community/composeFormat"
import { cn } from "@/lib/ui/utils"

export function CommunityComposer({
  onPost,
}: {
  onPost: (text: string) => Promise<string | null>
}) {
  const t = useTranslations("community")
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !!text.trim()

  const applyEdit = (edit: ReturnType<typeof wrapMarkers>) => {
    const el = textareaRef.current
    if (!el) return
    applyTextEdit(el, edit)
    setText(el.value)
  }

  const withSelection = (fn: (value: string, start: number, end: number) => ReturnType<typeof wrapMarkers>) => {
    const el = textareaRef.current
    if (!el) return
    applyEdit(fn(el.value, el.selectionStart, el.selectionEnd))
  }

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setText("")
    setError(null)
    void onPost(trimmed).then((err) => {
      if (err) {
        setError(err)
        setText(trimmed)
      }
    })
  }

  const runClipboard = async (action: "cut" | "copy" | "paste") => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const { selectionStart, selectionEnd, value } = el
    const selected = value.slice(selectionStart, selectionEnd)

    if (action === "copy" && selected) {
      await navigator.clipboard.writeText(selected)
      return
    }

    if (action === "cut" && selected) {
      await navigator.clipboard.writeText(selected)
      const next = `${value.slice(0, selectionStart)}${value.slice(selectionEnd)}`
      applyEdit({ value: next, selectionStart, selectionEnd: selectionStart })
      return
    }

    if (action === "paste") {
      const clip = await navigator.clipboard.readText()
      const next = `${value.slice(0, selectionStart)}${clip}${value.slice(selectionEnd)}`
      const end = selectionStart + clip.length
      applyEdit({ value: next, selectionStart: end, selectionEnd: end })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey
    if (!mod) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
      return
    }

    const shift = e.shiftKey
    const key = e.key.toLowerCase()

    const formatMap: Record<string, () => void> = {
      b: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "*", "*")),
      i: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "_", "_")),
      u: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "__", "__")),
      k: () => withSelection(insertLink),
    }

    if (!shift && formatMap[key]) {
      e.preventDefault()
      formatMap[key]()
      return
    }

    if (shift && key === "x") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "~", "~"))
      return
    }
    if (shift && key === "m") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "`", "`"))
      return
    }
    if (shift && key === "p") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "||", "||"))
      return
    }
    if (shift && key === "d") {
      e.preventDefault()
      withSelection(insertDateStamp)
      return
    }
    if (shift && key === "n") {
      e.preventDefault()
      withSelection(clearFormatting)
      return
    }
    if (shift && (key === "." || key === ">")) {
      e.preventDefault()
      withSelection(prefixQuoteLines)
    }
  }

  return (
    <div className="shrink-0 border-t border-border/30 bg-background/35 rounded-4xl m-2 px-3 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      <div className="flex items-end gap-2">
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("postPlaceholder")}
                maxLength={2000}
                rows={1}
                className={cn(
                  "field-sizing-content min-h-[42px] max-h-28 min-w-0 flex-1 resize-none rounded-2xl border border-border/40 bg-background/45 px-4 py-2.5 text-sm outline-none backdrop-blur-sm",
                  "placeholder:text-muted-foreground focus-visible:border-border/60 focus-visible:ring-2 focus-visible:ring-ring/20"
                )}
              />
            }
          />
          <ContextMenuContent className="w-56">
            <ContextMenuGroup>
              <ContextMenuItem disabled onClick={() => document.execCommand("undo")}>
                {t("undo")}
                <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled onClick={() => document.execCommand("redo")}>
                {t("redo")}
                <ContextMenuShortcut>Ctrl+Shift+Z</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem onClick={() => void runClipboard("cut")}>
                {t("cut")}
                <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => void runClipboard("copy")}>
                {t("copy")}
                <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => void runClipboard("paste")}>
                {t("paste")}
                <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  const el = textareaRef.current
                  if (!el || el.selectionStart === el.selectionEnd) return
                  const next = `${el.value.slice(0, el.selectionStart)}${el.value.slice(el.selectionEnd)}`
                  applyEdit({
                    value: next,
                    selectionStart: el.selectionStart,
                    selectionEnd: el.selectionStart,
                  })
                }}
              >
                {t("deleteSelection")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>{t("formatMenu")}</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-52">
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "*", "*"))}>
                  {t("formatBold")}
                  <ContextMenuShortcut>Ctrl+B</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "_", "_"))}>
                  {t("formatItalic")}
                  <ContextMenuShortcut>Ctrl+I</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "__", "__"))}>
                  {t("formatUnderline")}
                  <ContextMenuShortcut>Ctrl+U</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "~", "~"))}>
                  {t("formatStrike")}
                  <ContextMenuShortcut>Ctrl+Shift+X</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection(prefixQuoteLines)}>
                  {t("formatQuote")}
                  <ContextMenuShortcut>Ctrl+Shift+&gt;</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "`", "`"))}>
                  {t("formatMono")}
                  <ContextMenuShortcut>Ctrl+Shift+M</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "||", "||"))}>
                  {t("formatSpoiler")}
                  <ContextMenuShortcut>Ctrl+Shift+P</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => withSelection(insertLink)}>
                  {t("formatLink")}
                  <ContextMenuShortcut>Ctrl+K</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => withSelection(insertDateStamp)}>
                  {t("formatDate")}
                  <ContextMenuShortcut>Ctrl+Shift+D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => withSelection(clearFormatting)}>
                  {t("formatClear")}
                  <ContextMenuShortcut>Ctrl+Shift+N</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              onClick={() => {
                textareaRef.current?.select()
              }}
            >
              {t("selectAll")}
              <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canSend}
          className={cn(
            "size-11 shrink-0 rounded-full bg-transparent hover:bg-background/40",
            !canSend && "opacity-40"
          )}
          aria-label={t("sendAria")}
          onClick={submit}
        >
          <AppIcon name="chatSend" size={26} mono className={canSend ? "opacity-100" : "opacity-70"} />
        </Button>
      </div>
      {error && <p className="mt-1.5 px-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
