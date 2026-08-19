"use client"

import { useEffect, useState } from "react"
import { PackagesHero } from "@/components/products/icfalcon/packages-hero"
import { PackagesGrid } from "@/components/products/icfalcon/packages-grid"
import type { FalconPackage } from "@/services/products/falcon/packages"

export default function PackagesPage() {
  const [packages, setPackages] = useState<FalconPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPackages() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/prasangapokharel/icp-hub/refs/heads/master/index.json"
        )
        const data: { packages: Record<string, { version: string; description: string; path: string; import: string }> } = await response.json()
        const pkgs = Object.entries(data.packages).map(([slug, pkg]) => ({
          slug,
          ...pkg,
        }))
        setPackages(pkgs)
      } catch (error) {
        console.error("Failed to load packages:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPackages()
  }, [])

  return (
    <div className="min-h-screen">
      <PackagesHero />
      {loading ? (
        <div className="flex justify-center py-16">
          <p className="text-sm text-muted-foreground">Loading packages...</p>
        </div>
      ) : (
        <PackagesGrid packages={packages} />
      )}
    </div>
  )
}
