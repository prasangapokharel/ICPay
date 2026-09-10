"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Folder02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  blogPostPath,
  type BlogPost,
} from "@/services/blog/blog"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function BlogSidebar({
  suggestions,
  categoriesWithCounts,
}: {
  suggestions: BlogPost[]
  categoriesWithCounts: { category: string; count: number }[]
}) {
  return (
    <ScrollArea className="h-full max-h-[calc(100vh-8rem)] w-full">
      <div className="space-y-6 p-4 md:p-6">
        {/* Join ICPay Card */}
        <Card className="relative overflow-hidden border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm">
          {/* Organic hero background floating shapes */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-6 size-32 rotate-12 rounded-[2rem] bg-primary/20 dark:bg-primary/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -bottom-6 size-36 -rotate-6 rounded-[2.5rem] bg-primary/15 dark:bg-primary/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-1/4 top-1/2 size-20 -translate-y-1/2 rotate-45 rounded-[1.2rem] bg-primary/10 dark:bg-primary/10"
          />

          <CardContent className="relative z-10 space-y-4 p-5">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Get started with ICPay
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Send &amp; receive ICP with your unique username. Passkey biometric login via Internet
                Identity, zero seed phrases, and real on-chain custody.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-primary" />
                <span>Instant @username sends</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-primary" />
                <span>Zero seed phrases required</span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-primary" />
                <span>ICRC-1 &amp; canister management</span>
              </li>
            </ul>

            <div className="space-y-2 pt-1">
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/login" />}
                className="w-full font-medium"
              >
                Open Wallet Free
              </Button>
              <div className="text-center">
                <Link
                  href="/about"
                  className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Learn how ICPay works →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-border/60" />

        {/* Suggested / Related Articles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Suggested Reading
            </h4>
            <Link
              href="/blog"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              All posts
            </Link>
          </div>

          <div className="space-y-2.5">
            {suggestions.map((post) => (
              <Link
                key={post.slug}
                href={blogPostPath(post.slug)}
                className="group block rounded-xl border border-border/40 bg-card/60 p-3 transition-colors hover:border-border hover:bg-card hover:shadow-xs"
              >
                {post.category && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {post.category}
                  </span>
                )}
                <h5 className="line-clamp-2 text-xs font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h5>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDate(post.publishedAt)} · {post.readingMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Topics & Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Folder02Icon} className="size-3.5 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Explore Topics
            </h4>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categoriesWithCounts.map(({ category, count }) => (
              <Link
                key={category}
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <span>{category}</span>
                <span className="rounded-full bg-border/50 px-1.5 py-0.2 text-[9px] text-foreground/70">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
