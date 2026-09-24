"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  Search01Icon,
  Cancel01Icon,
  SparklesIcon,
  Shield01Icon,
  Coins01Icon,
  DatabaseIcon,
  CheckmarkCircle02Icon,
  Layers01Icon,
  FlashIcon,
  LinkSquare02Icon,
  GridViewIcon,
  ListViewIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/ui/utils"
import type { FalconPackage } from "@/services/products/falcon/packages"

export type CategoryKey =
  | "all"
  | "security"
  | "financial"
  | "storage"
  | "validation"
  | "network"
  | "core"

interface CategoryDef {
  key: CategoryKey
  label: string
  icon: typeof SparklesIcon
  slugs?: string[]
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "all",
    label: "All Packages",
    icon: SparklesIcon,
  },
  {
    key: "security",
    label: "Auth & Security",
    icon: Shield01Icon,
    slugs: ["rbac", "caller", "session", "rate-limit", "multisig", "whitelist", "api-key", "dao", "sanitize"],
  },
  {
    key: "financial",
    label: "Tokens & ICRC",
    icon: Coins01Icon,
    slugs: ["icrc1", "icrc2", "ledger", "escrow", "wallet", "nft", "cycles"],
  },
  {
    key: "storage",
    label: "Storage & State",
    icon: DatabaseIcon,
    slugs: ["crud", "storage", "cache", "indexer", "migration", "upgrade", "blob", "asset", "upload"],
  },
  {
    key: "validation",
    label: "Validation & Errors",
    icon: CheckmarkCircle02Icon,
    slugs: ["errors", "validate-text", "validate-nat", "validate-email", "validate-url", "validate-json", "validate-principal"],
  },
  {
    key: "network",
    label: "Network & Interop",
    icon: Layers01Icon,
    slugs: ["http", "canister-call", "webhook", "json", "csv", "base64", "candid-utils"],
  },
  {
    key: "core",
    label: "Utils & Core",
    icon: FlashIcon,
    slugs: ["pagination", "time", "uuid", "slug", "search", "sort", "filter", "retry", "circuit-breaker", "nanoid", "date", "cron", "array", "list", "math", "string", "random", "logger", "env", "feature-flag", "test", "mock", "seed"],
  },
]

function getPackageCategory(slug: string): CategoryDef {
  for (const cat of CATEGORIES) {
    if (cat.slugs?.includes(slug)) {
      return cat
    }
  }
  return CATEGORIES[6] // default to Core
}

type PackagesGridProps = {
  packages: FalconPackage[]
}

const ITEMS_PER_PAGE = 12

export function PackagesGrid({ packages }: PackagesGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedAction, setCopiedAction] = useState<string | null>(null)

  const handleCopy = async (text: string, actionKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAction(actionKey)
      setTimeout(() => setCopiedAction(null), 2000)
    } catch {
      // Ignore clipboard write failure
    }
  }

  // Filter packages
  const filteredPackages = useMemo(() => {
    let result = packages

    // Category filter
    if (selectedCategory !== "all") {
      const activeDef = CATEGORIES.find((c) => c.key === selectedCategory)
      if (activeDef?.slugs) {
        result = result.filter((pkg) => activeDef.slugs!.includes(pkg.slug))
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (pkg) =>
          pkg.slug.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query) ||
          pkg.import.toLowerCase().includes(query) ||
          pkg.path.toLowerCase().includes(query)
      )
    }

    return result
  }, [packages, selectedCategory, searchQuery])

  // Reset pagination on filter change
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPackages = filteredPackages.slice(startIndex, endIndex)

  const handleCategoryChange = (key: CategoryKey) => {
    setSelectedCategory(key)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const progressPercentage = Math.round(
    (filteredPackages.length / (packages.length || 1)) * 100
  )

  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== "undefined") {
      const el = document.getElementById("packages-catalog")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <section id="packages-catalog" className="scroll-mt-12 space-y-8">
      {/* Search and Filter Controls */}
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search by package name, keyword, or import path..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 pl-9 pr-9 rounded-xl border-border/60 bg-background/80 text-sm focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center rounded-xl border border-border/60 bg-background/80 p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="size-8 rounded-lg cursor-pointer"
                title="Grid View"
                aria-label="Grid View"
              >
                <HugeiconsIcon icon={GridViewIcon} className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="size-8 rounded-lg cursor-pointer"
                title="List View"
                aria-label="List View"
              >
                <HugeiconsIcon icon={ListViewIcon} className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Pills — Single clean icon style */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === "all"
                ? packages.length
                : packages.filter((p) => cat.slugs?.includes(p.slug)).length

            const isSelected = selectedCategory === cat.key

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/60 text-muted-foreground border-border/60 hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={cat.icon}
                  className={cn("size-3.5", isSelected ? "text-primary-foreground" : "text-primary")}
                />
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Stats & Progression Bar */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground">{filteredPackages.length}</strong> of{" "}
              <strong className="text-foreground">{packages.length}</strong> total packages
            </span>
            {searchQuery && (
              <Badge variant="outline" className="text-[10px] font-normal py-0">
                Filtered by &quot;{searchQuery}&quot;
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[11px]">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Package Items / Empty State */}
      {filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center backdrop-blur-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-primary mb-4">
            <HugeiconsIcon icon={Package01Icon} className="size-7" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Motoko Packages Found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No packages matched your search criteria. Try a different keyword or select another category filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}
            className="mt-4 rounded-xl text-xs cursor-pointer"
          >
            Reset All Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentPackages.map((pkg) => {
            const cat = getPackageCategory(pkg.slug)
            const installCmd = `falcon add pkg ${pkg.slug}`
            const cmdCopied = copiedAction === `cmd-${pkg.slug}`
            const importCopied = copiedAction === `imp-${pkg.slug}`

            return (
              <Card
                key={pkg.slug}
                size="sm"
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/65 p-4.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card/90 hover:shadow-xl"
              >
                <div className="space-y-3">
                  <CardHeader className="p-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={cat.icon} className="size-4 shrink-0 text-primary" />
                        <CardTitle className="font-mono text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {pkg.slug}
                        </CardTitle>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-md border border-border/50 bg-background/80 font-mono text-[10px] px-1.5 py-0 font-medium"
                      >
                        v{pkg.version}
                      </Badge>
                    </div>

                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 space-y-2.5 pt-1">
                    {/* Command Box */}
                    <div className="relative rounded-xl border border-border/60 bg-background/90 p-2 pr-9 transition-colors group-hover:border-border">
                      <code className="block overflow-x-auto font-mono text-xs text-foreground/90 select-all">
                        {installCmd}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleCopy(installCmd, `cmd-${pkg.slug}`)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                        aria-label="Copy install command"
                      >
                        <HugeiconsIcon
                          icon={cmdCopied ? Tick02Icon : Copy01Icon}
                          className={cn("size-3.5 transition-colors", cmdCopied ? "text-primary" : "text-muted-foreground")}
                        />
                      </Button>
                    </div>

                    {/* Import Path */}
                    <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground rounded-lg bg-muted/40 px-2.5 py-1.5">
                      <span className="font-medium text-muted-foreground/80 shrink-0">Import:</span>
                      <code className="truncate font-mono text-[11px] text-foreground/80 select-all" title={pkg.import}>
                        {pkg.import}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(pkg.import, `imp-${pkg.slug}`)}
                        className="ml-1 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy import path"
                      >
                        <HugeiconsIcon
                          icon={importCopied ? Tick02Icon : Copy01Icon}
                          className={cn("size-3", importCopied ? "text-primary" : "text-muted-foreground")}
                        />
                      </button>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer Link */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={cat.icon} className="size-3 text-primary" />
                    <span>{cat.label}</span>
                  </span>
                  <Link
                    href={`https://github.com/prasangapokharel/icp-hub/tree/master/${pkg.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-medium transition-all"
                  >
                    <span>Source</span>
                    <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {currentPackages.map((pkg) => {
            const cat = getPackageCategory(pkg.slug)
            const installCmd = `falcon add pkg ${pkg.slug}`
            const cmdCopied = copiedAction === `cmd-${pkg.slug}`

            return (
              <div
                key={pkg.slug}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-card/90"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <HugeiconsIcon icon={cat.icon} className="size-4.5 shrink-0 text-primary mt-1" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {pkg.slug}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0">
                        v{pkg.version}
                      </Badge>
                      <span className="hidden sm:inline-block text-[11px] text-muted-foreground">
                        ({cat.label})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{pkg.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <code className="hidden md:inline-block font-mono text-xs bg-muted/60 px-2 py-1 rounded-md text-foreground">
                    {installCmd}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(installCmd, `cmd-${pkg.slug}`)}
                    className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={cmdCopied ? Tick02Icon : Copy01Icon}
                      className={cn("size-3.5", cmdCopied ? "text-primary" : "text-muted-foreground")}
                    />
                    <span>{cmdCopied ? "Copied" : "Copy Install"}</span>
                  </Button>
                  <Link
                    href={`https://github.com/prasangapokharel/icp-hub/tree/master/${pkg.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground transition-colors"
                    title="View Source on GitHub"
                  >
                    <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{safePage}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="h-8 gap-1 rounded-lg text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              <span>Previous</span>
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= safePage - 1 && page <= safePage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === safePage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="size-8 rounded-lg p-0 text-xs font-mono cursor-pointer"
                    >
                      {page}
                    </Button>
                  )
                } else if (page === safePage - 2 || page === safePage + 2) {
                  return (
                    <span key={page} className="px-1 text-xs text-muted-foreground">
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
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="h-8 gap-1 rounded-lg text-xs cursor-pointer"
            >
              <span>Next</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
