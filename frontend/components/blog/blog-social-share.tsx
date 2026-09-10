"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons"

export function BlogSocialShare({
  title,
  slug,
}: {
  title?: string
  slug?: string
}) {
  const [copied, setCopied] = useState(false)

  const canonicalUrl = slug ? `https://icpay.app/blog/${slug}` : "https://icpay.app/blog"
  const shareTitle = title ? encodeURIComponent(title) : encodeURIComponent("ICPay Blog")
  const encodedUrl = encodeURIComponent(canonicalUrl)

  const handleCopy = async () => {
    const url = typeof window !== "undefined" ? window.location.href : canonicalUrl
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Curved Share Icon */}
      <span className="flex items-center justify-center text-muted-foreground/80" title="Share">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 text-muted-foreground"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </span>

      {/* Facebook Button */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 shadow-2xs"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Telegram Button */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
        className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 shadow-2xs"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
        </svg>
      </a>

      {/* X / Twitter Button */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 shadow-2xs"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Copy Link Button */}
      <button
        onClick={handleCopy}
        type="button"
        aria-label="Copy link to clipboard"
        title={copied ? "Copied!" : "Copy link"}
        className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 shadow-2xs cursor-pointer"
      >
        {copied ? (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-green-500" />
        ) : (
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
        )}
      </button>
    </div>
  )
}

export function BlogBottomShare({
  title,
  slug,
}: {
  title?: string
  slug?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 my-8">
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold text-foreground">Share this article</h4>
        <p className="text-xs text-muted-foreground">Found this helpful? Share it with your community or network.</p>
      </div>
      <BlogSocialShare title={title} slug={slug} />
    </div>
  )
}
