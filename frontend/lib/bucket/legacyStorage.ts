/** Remove pre-backend folder keys — folders now live on the canister only. */
const LEGACY_PREFIXES = ["icpay:bucket-", "bucket-folder:", "icbucket:folder"] as const

export function clearLegacyBucketStorage(): void {
  if (typeof localStorage === "undefined") return
  const remove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      remove.push(key)
    }
  }
  for (const key of remove) {
    localStorage.removeItem(key)
  }
}
