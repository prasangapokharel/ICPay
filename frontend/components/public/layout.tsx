import { PublicFooter } from "@/components/public/footer"
import { PublicNav } from "@/components/public/nav"
import { cn } from "@/lib/ui/utils"

export type PublicLayoutVariant = "content" | "wide"

export function PublicLayout({
  children,
  variant = "content",
}: {
  children: React.ReactNode
  variant?: PublicLayoutVariant
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicNav />
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
      <PublicFooter />
    </div>
  )
}
