"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import {
  parseTelegramMessage,
  type BlockNode,
  type InlineNode,
} from "@/lib/community/telegramMarkdown"
import { findMessageSourceUrl, sourceFaviconUrl } from "@/lib/community/messageSource"
import { cn } from "@/lib/ui/utils"

function Spoiler({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline rounded px-0.5 align-baseline transition-colors",
        open
          ? "bg-muted/60 text-foreground"
          : "bg-muted-foreground/30 text-transparent [text-shadow:0_0_6px_rgba(0,0,0,0.45)] hover:bg-muted-foreground/40 dark:[text-shadow:0_0_6px_rgba(255,255,255,0.35)]"
      )}
    >
      {children}
    </button>
  )
}

function renderInline(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    switch (node.kind) {
      case "text":
        return node.value
      case "bold":
        return <strong key={key}>{renderInline(node.children, key)}</strong>
      case "italic":
        return <em key={key}>{renderInline(node.children, key)}</em>
      case "underline":
        return <span key={key} className="underline">{renderInline(node.children, key)}</span>
      case "strike":
        return <s key={key}>{renderInline(node.children, key)}</s>
      case "spoiler":
        return <Spoiler key={key}>{renderInline(node.children, key)}</Spoiler>
      case "code":
        return (
          <code
            key={key}
            className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[0.92em]"
          >
            {node.value}
          </code>
        )
      case "link":
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {renderInline(node.children, key)}
          </a>
        )
    }
  })
}

function renderBlock(
  block: BlockNode,
  index: number,
  sourceUrl: string | null,
  firstQuoteIndex: number
): ReactNode {
  if (block.kind === "pre") {
    return (
      <pre
        key={`pre-${index}`}
        className="my-1 overflow-x-auto rounded-lg bg-muted/80 px-3 py-2 font-mono text-[13px] leading-relaxed"
      >
        {block.value}
      </pre>
    )
  }

  const content = renderInline(block.children, `line-${index}`)
  if (block.quote) {
    const showSourceIcon = Boolean(sourceUrl && index === firstQuoteIndex)
    return (
      <blockquote
        key={`quote-${index}`}
        className={cn(
          "border-l-2 border-primary/35 pl-3 text-muted-foreground",
          showSourceIcon && "flex items-start gap-2"
        )}
      >
        {showSourceIcon ? (
          <Image
            src={sourceFaviconUrl(sourceUrl!)}
            alt=""
            width={16}
            height={16}
            unoptimized
            className="mt-0.5 size-4 shrink-0 rounded-sm"
          />
        ) : null}
        <span>{content}</span>
      </blockquote>
    )
  }

  return <span key={`line-${index}`}>{content}</span>
}

export function CommunityMessageBody({ text }: { text: string }) {
  const blocks = parseTelegramMessage(text)
  const sourceUrl = findMessageSourceUrl(text)
  const firstQuoteIndex = blocks.findIndex(
    (block) => block.kind === "line" && block.quote
  )

  return (
    <span className="whitespace-pre-wrap break-words text-[15px] leading-[1.5]">
      {blocks.map((block, index) => (
        <span key={index}>
          {renderBlock(block, index, sourceUrl, firstQuoteIndex)}
          {index < blocks.length - 1 ? "\n" : null}
        </span>
      ))}
    </span>
  )
}
