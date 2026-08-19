export type FalconPackage = {
  slug: string
  version: string
  description: string
  path: string
  import: string
}

export type PackageIndex = {
  version: number
  registry: string
  packages: Record<string, Omit<FalconPackage, "slug">>
}

const PACKAGE_INDEX_URL =
  "https://raw.githubusercontent.com/prasangapokharel/icp-hub/refs/heads/master/index.json"

export async function fetchFalconPackages(): Promise<FalconPackage[]> {
  const response = await fetch(PACKAGE_INDEX_URL, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch package index")
  }

  const data: PackageIndex = await response.json()

  return Object.entries(data.packages).map(([slug, pkg]) => ({
    slug,
    ...pkg,
  }))
}

