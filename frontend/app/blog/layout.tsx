import Link from "next/link"

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
            <span aria-hidden className="text-lg leading-none">←</span>
          </Link>
          <Link href="/blog" className="text-sm font-semibold tracking-tight hover:text-primary">
            ICPay Blog
          </Link>
        </header>
        <main className="flex-1 px-4 py-6">{children}</main>
        <footer className="border-t px-4 py-5">
          <nav className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <Link href="/channels" className="text-muted-foreground hover:text-foreground">
              Communities
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              About
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">© 2026 ICPay. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
