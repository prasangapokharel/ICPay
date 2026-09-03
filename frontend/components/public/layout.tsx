import { Suspense } from "react"
import { PublicFooterGate } from "@/components/public/footer-gate"
import { PublicNav } from "@/components/public/nav"
import { cn } from "@/lib/ui/utils"

export type PublicLayoutVariant = "content" | "wide"

function PublicNavFallback() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/60 bg-background/95 backdrop-blur-md md:h-16" />
  )
}

export function PublicLayout({
  children,
  variant = "content",
}: {
  children: React.ReactNode
  variant?: PublicLayoutVariant
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Suspense fallback={<PublicNavFallback />}>
        <PublicNav />
      </Suspense>
      <main
        className={cn(
          "flex-1",
          variant === "content" &&
            "mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12 lg:max-w-4xl",
          variant === "wide" && "w-full"
        )}
      >
        {children}
      </main>
      <PublicFooterGate />
    </div>
  )
}
