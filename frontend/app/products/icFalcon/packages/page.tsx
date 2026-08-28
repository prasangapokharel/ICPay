"use client"

import { useState, useEffect } from "react"
import { PackagesHero } from "@/components/products/icfalcon/packages-hero"
import { PackagesGrid } from "@/components/products/icfalcon/packages-grid"
import { Button } from "@/components/ui/button"
import { ProductFooter } from "@/components/products/shared/product-footer"

const PACKAGES_PER_PAGE = 12

type FalconPackage = {
  slug: string
  version: string
  description: string
  path: string
  import: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<FalconPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/prasangapokharel/icp-hub/refs/heads/master/index.json"
        )
        const data: { packages: Record<string, { version: string; description: string; path: string; import: string }> } = await response.json()
        
        const packagesArray = Object.entries(data.packages).map(([slug, info]) => ({
          slug,
          ...info,
        }))
        
        setPackages(packagesArray)
      } catch (error) {
        console.error("Failed to fetch packages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const totalPages = Math.ceil(packages.length / PACKAGES_PER_PAGE)
  const startIndex = (currentPage - 1) * PACKAGES_PER_PAGE
  const endIndex = startIndex + PACKAGES_PER_PAGE
  const currentPackages = packages.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen">
      <PackagesHero />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading packages...</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, packages.length)} of {packages.length} packages
                </p>
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              <PackagesGrid packages={currentPackages} />

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    Previous
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="min-w-[2.5rem]"
                          >
                            {page}
                          </Button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-sm text-muted-foreground">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ProductFooter />
    </div>
  )
}
