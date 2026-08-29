import { BucketDocsChrome } from "@/components/products/icbucket/bucket-docs-chrome"
import { BucketDocsCopyMenu } from "@/components/products/icbucket/bucket-docs-copy-menu"
import { BucketDocsNav } from "@/components/products/icbucket/bucket-docs-sidebar"
import { BucketDocsPageToc } from "@/components/products/icbucket/bucket-docs-page-toc"
import type { BucketDocNavGroup, LoadedBucketDoc } from "@/lib/bucket/docs/types"

type BucketDocsShellProps = {
  doc: LoadedBucketDoc
  navGroups: BucketDocNavGroup[]
  backHref?: string
}

export function BucketDocsShell({ doc, navGroups, backHref = "/icbucket" }: BucketDocsShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <BucketDocsChrome navGroups={navGroups} backHref={backHref} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16rem_minmax(0,1fr)_13rem] xl:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <BucketDocsNav groups={navGroups} />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-8 space-y-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                {doc.eyebrow ? (
                  <p className="text-sm font-medium text-primary">{doc.eyebrow}</p>
                ) : doc.slug ? (
                  <p className="text-sm font-medium text-primary">{doc.group}</p>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{doc.title}</h1>
                {doc.description ? (
                  <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                    {doc.description}
                  </p>
                ) : null}
              </div>
              <BucketDocsCopyMenu markdown={doc.fullMarkdown} />
            </div>
          </header>
          <div className="max-w-none pb-16">{doc.content}</div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pl-2">
            <BucketDocsPageToc headings={doc.headings} />
          </div>
        </aside>
      </div>
    </div>
  )
}
