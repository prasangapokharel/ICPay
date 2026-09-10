"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { BLOG_POSTS } from "@/services/blog/blog"

export function BlogLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isArticle = pathname.startsWith("/blog/") && pathname !== "/blog" && pathname !== "/blog/"
  const slug = isArticle ? pathname.replace(/^\/blog\/?/, "").split("/")[0] : ""

  const currentPost = useMemo(() => {
    if (!slug) return null
    return BLOG_POSTS.find((p) => p.slug === slug) ?? null
  }, [slug])

  const suggestions = useMemo(() => {
    if (!slug) return []
    const others = BLOG_POSTS.filter((p) => p.slug !== slug)
    if (currentPost?.category) {
      const sameCategory = others.filter((p) => p.category === currentPost.category)
      const otherCategory = others.filter((p) => p.category !== currentPost.category)
      return [...sameCategory, ...otherCategory].slice(0, 4)
    }
    return others.slice(0, 4)
  }, [slug, currentPost])

  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of BLOG_POSTS) {
      if (post.category) {
        map.set(post.category, (map.get(post.category) ?? 0) + 1)
      }
    }
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  // If on the blog index page (/blog), render normal full-width container
  if (!isArticle) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {children}
      </div>
    )
  }

  // If on a blog article details page (/blog/[slug])
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to all guides</span>
        </Link>

        {currentPost?.category && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Topic:</span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {currentPost.category}
            </span>
          </div>
        )}
      </div>

      {/* Main Section-Based Responsive Grid Layout (No Resizer) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Main Article Card Section */}
        <main className="lg:col-span-8 min-w-0">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 md:p-10 shadow-xs backdrop-blur-xs">
            <div className="mx-auto max-w-3xl">{children}</div>
          </div>
        </main>

        {/* Sticky Sidebar Section */}
        <aside className="lg:col-span-4 min-w-0 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border/60 bg-card/40 shadow-xs backdrop-blur-xs">
            <BlogSidebar
              suggestions={suggestions}
              categoriesWithCounts={categoriesWithCounts}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
