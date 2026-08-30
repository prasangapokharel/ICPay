const PRODUCT_LANDING: Record<string, string> = {
  "bucket.icpay.app": "/icbucket",
  "falcon.icpay.app": "/icfalcon",
}

export function normalizeHost(host: string | null): string | null {
  if (!host) return null
  return host.split(":")[0]?.toLowerCase() ?? null
}

/** Internal rewrite target for product subdomains, or null when unchanged. */
export function productHostRewritePath(host: string | null, pathname: string): string | null {
  const normalized = normalizeHost(host)
  if (!normalized) return null

  if (normalized === "docs.icpay.app") {
    if (pathname.startsWith("/bucket/docs")) return null
    return pathname === "/" ? "/bucket/docs" : `/bucket/docs${pathname}`
  }

  const landing = PRODUCT_LANDING[normalized]
  if (!landing) return null

  if (pathname === landing || pathname.startsWith(`${landing}/`)) return null
  if (pathname !== "/") return null

  return landing
}
