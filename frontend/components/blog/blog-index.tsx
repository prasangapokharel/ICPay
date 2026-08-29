"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  blogCategories,
  blogPostPath,
  filterBlogPostsByCategory,
  type BlogPost,
} from "@/services/blog/blog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      {category}
    </span>
  )
}

function BlogFeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={blogPostPath(post.slug)}
      className="group block rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
    >
      <div className="space-y-3">
        {post.category && <CategoryBadge category={post.category} />}
        <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary md:text-3xl">
          {post.title}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {post.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>
      </div>
    </Link>
  )
}

function BlogGridCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={blogPostPath(post.slug)}
      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-1 flex-col gap-2">
        {post.category && <CategoryBadge category={post.category} />}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>
      </div>
    </Link>
  )
}

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(() => ["all", ...blogCategories()], [])
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredPosts = useMemo(
    () => filterBlogPostsByCategory(posts, activeCategory),
    [posts, activeCategory]
  )

  const featured = filteredPosts[0]
  const gridPosts = filteredPosts.slice(1)

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Blog</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Guides for ICP and ICPay, plus developer resources for our open packages.
        </p>
      </header>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="gap-6">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
          <TabsList
            variant="line"
            className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-2 rounded-none bg-transparent p-0 md:flex-wrap md:gap-2"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-9 shrink-0 flex-none rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground data-active:border-primary data-active:bg-primary/10 data-active:text-primary"
              >
                {category === "all" ? "All" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {featured && <BlogFeaturedCard post={featured} />}

      {gridPosts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <BlogGridCard key={post.slug} post={post} />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts in this category yet.</p>
      ) : null}
    </div>
  )
}
