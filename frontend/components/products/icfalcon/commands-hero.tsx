import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CommandsHero() {
  return (
    <section className="border-b px-4 py-16 text-center">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Falcon CLI Commands
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete reference for the global falcon CLI. All commands target
          mainnet by default — append <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">--local</code> for local replica.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/products/icFalcon" />}
          >
            ICFalcon
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/products/icFalcon/packages" />}
          >
            Packages
          </Button>
        </div>
      </div>
    </section>
  )
}
