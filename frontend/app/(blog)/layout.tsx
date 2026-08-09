import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <Link
            href="/"
            aria-label="Back to ICPay"
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </Link>
          <span className="text-sm font-semibold tracking-tight">ICPay Blog</span>
        </header>
        <main className="flex-1 px-4 py-6">{children}</main>
        <footer className="border-t px-4 py-5">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ICPay. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
