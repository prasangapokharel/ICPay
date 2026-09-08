import { BucketDocsChrome } from "@/components/products/icbucket/bucket-docs-chrome"
import {
  BucketDocsNavFallback,
} from "@/components/products/icbucket/bucket-docs-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { buildNavGroups } from "@/lib/bucket/docs/nav"
import { loadAllDocMeta } from "@/lib/bucket/docs/load"

export function BucketDocsPageFallback() {
  const navGroups = buildNavGroups(loadAllDocMeta())

  return (
    <div className="min-h-screen bg-background">
      <BucketDocsChrome navGroups={navGroups} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16rem_minmax(0,1fr)_13rem] xl:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <BucketDocsNavFallback groups={navGroups} />
          </div>
        </aside>

        <article className="min-w-0 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-2/3 max-w-xl" />
          <Skeleton className="h-20 w-full max-w-3xl" />
          <Skeleton className="h-64 w-full" />
        </article>
      </div>
    </div>
  )
}
