import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { blogPostPath, type BlogPost } from "@/services/blog/blog"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={blogPostPath(post.slug)}
      className="group flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent/40"
    >
      <div className="min-w-0 flex-1 space-y-1">
        {post.category && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {post.category}
          </p>
        )}
        <h2 className="text-sm font-semibold leading-snug tracking-tight group-hover:text-primary">
          {post.title}
        </h2>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {post.description}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>
      </div>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        strokeWidth={1.75}
      />
    </Link>
  )
}
