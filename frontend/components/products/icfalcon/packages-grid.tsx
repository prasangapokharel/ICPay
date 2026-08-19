"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FalconPackage } from "@/services/products/falcon/packages"

type PackagesGridProps = {
  packages: FalconPackage[]
}

export function PackagesGrid({ packages }: PackagesGridProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const handleCopy = async (slug: string) => {
    await navigator.clipboard.writeText(`falcon add pkg ${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          All Packages
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.slug} size="sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-mono text-sm">
                    {pkg.slug}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {pkg.version}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <pre className="overflow-x-auto rounded bg-muted/30 p-2 pr-10 text-xs font-mono">
                    <code>falcon add pkg {pkg.slug}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(pkg.slug)}
                    className="absolute top-2 right-2 transition-colors hover:text-foreground"
                    aria-label="Copy install command"
                  >
                    <HugeiconsIcon
                      icon={
                        copiedSlug === pkg.slug ? Tick02Icon : Copy01Icon
                      }
                      className="size-4"
                    />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">Import:</span>{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    {pkg.import}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
