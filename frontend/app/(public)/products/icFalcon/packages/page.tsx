"use client"

import { useState, useEffect } from "react"
import { PackagesHero } from "@/components/products/icfalcon/packages-hero"
import { PackagesGrid } from "@/components/products/icfalcon/packages-grid"
import { fetchFalconPackages, type FalconPackage } from "@/services/products/falcon/packages"
import { Skeleton } from "@/components/ui/skeleton"

export default function PackagesPage() {
  const [packages, setPackages] = useState<FalconPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchFalconPackages()
      .then((data) => {
        if (!cancelled) setPackages(data)
      })
      .catch((error) => {
        console.error("Failed to fetch packages:", error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <PackagesHero />

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="space-y-6">
              {/* Skeleton controls */}
              <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6">
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Skeleton cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-5 space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-4 w-12 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PackagesGrid packages={packages} />
          )}
        </div>
      </div>
    </div>
  )
}
