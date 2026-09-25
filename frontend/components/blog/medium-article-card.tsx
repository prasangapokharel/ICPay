import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, BookOpen01Icon, FavouriteIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const MEDIUM_URL =
  "https://medium.com/@mrcupss.design/drafting-a-tool-agnostic-guide-to-building-without-code-4fa01b926619"

export function MediumIcon({ className = "size-5 fill-current" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1043.63 592.71"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460.03 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.18-124.94-147.18-279 65.88-279 147.16-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94" />
    </svg>
  )
}

export function MediumArticleCard({
  variant = "featured",
}: {
  variant?: "featured" | "compact" | "cta"
}) {
  if (variant === "compact") {
    return (
      <a
        href={MEDIUM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-4 transition-all hover:border-foreground/30 hover:bg-muted/40"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <MediumIcon className="size-5 fill-background" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
              Drafting a tool-agnostic guide to building without code.
            </p>
            <p className="text-[11px] text-muted-foreground">
              By @mrcupss.design on Medium · 4 min read
            </p>
          </div>
        </div>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
        />
      </a>
    )
  }

  if (variant === "cta") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-muted/40 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <MediumIcon className="size-4 fill-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Read on Medium
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              Support the author & join the discussion
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              If this no-code framework helped you, give it a clap on Medium and follow{" "}
              <strong className="text-foreground">@mrcupss.design</strong> for more guides on on-chain
              product design and decentralized architecture.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              nativeButton={false}
              render={
                <a href={MEDIUM_URL} target="_blank" rel="noopener noreferrer" />
              }
              className="gap-2 rounded-full px-5 py-2.5 font-medium shadow-sm hover:shadow"
            >
              <HugeiconsIcon icon={FavouriteIcon} className="size-4" />
              <span>Read & Clap on Medium</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-8 shadow-sm">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <MediumIcon className="size-4 fill-background" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground">Medium Publication</span>
            <span className="text-muted-foreground"> · @mrcupss.design</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px] font-medium">
            4 min read
          </Badge>
          <Badge variant="outline" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Original Post
          </Badge>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="mt-5 space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
          <a href={MEDIUM_URL} target="_blank" rel="noopener noreferrer">
            Drafting a tool-agnostic guide to building without code.
          </a>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          How to Create and Launch an ICRC-1 Token on the Internet Computer: A platform-agnostic
          blueprint detailing the 4 core steps, immutable parameters, reverse gas benefits, and
          post-launch DEX mechanics.
        </p>
      </div>

      {/* Excerpt quote */}
      <div className="mt-4 rounded-xl border border-border/50 bg-muted/40 p-4 font-mono text-xs text-muted-foreground italic leading-relaxed">
        &ldquo;Launching a token on Ethereum or Solana usually means wrestling with local dev environments,
        smart contract audits, and gas fees. The Internet Computer takes a different approach — no Motoko,
        no Rust, and no command line required.&rdquo;
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon icon={BookOpen01Icon} className="size-4" />
          <span>Published by ICPay Creator</span>
        </div>
        <Button
          nativeButton={false}
          render={
            <a href={MEDIUM_URL} target="_blank" rel="noopener noreferrer" />
          }
          className="gap-2 rounded-full px-5 text-xs font-semibold shadow-sm cursor-pointer"
        >
          <span>Read Full Article on Medium</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
        </Button>
      </div>
    </div>
  )
}
