import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

const PAGES = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/brand-protection", label: "Brands" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/transparency", label: "Transparency" },
]

// Deliberately outside the (app) group: that layout redirects anyone who is not
// signed in, and these pages have to be readable before you have an account --
// and by a crawler, which never signs in at all.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
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
          <span className="text-sm font-semibold tracking-tight">ICPay</span>
        </header>

        <main className="flex-1 px-4 py-6">{children}</main>

        <footer className="border-t px-4 py-5">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {page.label}
              </Link>
            ))}
            <a
              href="https://github.com/prasangapokharel/ICPay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Source
            </a>
          </nav>
        </footer>
      </div>
    </div>
  )
}
