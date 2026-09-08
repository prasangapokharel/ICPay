/** Prefix like `photos/` (no leading slash). Empty string is the bucket root. */
export function normalizePrefix(prefix: string): string {
  const p = prefix.replace(/^\/+|\/+$/g, "")
  return p ? `${p}/` : ""
}

export function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "")
}

export function joinObjectPath(prefix: string, filePath: string): string {
  const file = stripLeadingSlash(filePath)
  return `/${normalizePrefix(prefix)}${file}`
}

export function relativeToPrefix(objectPath: string, prefix: string): string | null {
  const path = stripLeadingSlash(objectPath)
  const p = normalizePrefix(prefix)
  if (!p) return path
  const folderKey = p.slice(0, -1)
  if (path === folderKey) return ""
  if (!path.startsWith(p)) return null
  return path.slice(p.length)
}

export function sanitizeFolderName(name: string): string {
  const safe = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return safe.slice(0, 48)
}

export function nestedPrefix(prefix: string, folderName: string): string {
  return `${normalizePrefix(prefix)}${folderName}/`
}

export type FolderListEntry<T> =
  | { kind: "folder"; name: string }
  | { kind: "file"; file: T }

export function listFolderEntries<T extends { path: string }>(
  files: T[],
  prefix: string,
  apiFolders: string[] = [],
): FolderListEntry<T>[] {
  const folders = new Set<string>()
  const items: FolderListEntry<T>[] = []

  const consider = (rel: string | null, file?: T) => {
    if (rel === null || rel === "") return
    const slash = rel.indexOf("/")
    if (slash >= 0) {
      const name = rel.slice(0, slash)
      if (name) folders.add(name)
      return
    }
    if (file) items.push({ kind: "file", file })
  }

  for (const file of files) {
    consider(relativeToPrefix(file.path, prefix), file)
  }
  for (const name of apiFolders) {
    if (name) folders.add(name)
  }

  const folderItems: FolderListEntry<T>[] = [...folders]
    .sort()
    .map((name) => ({ kind: "folder", name }))

  return [...folderItems, ...items]
}

export function folderTotals<T extends { path: string; size: bigint }>(
  files: T[],
  prefix: string,
  folderName: string,
): { bytes: bigint; count: number } {
  const nested = nestedPrefix(prefix, folderName)
  const folderKey = nested.slice(0, -1)
  let bytes = 0n
  let count = 0
  for (const file of files) {
    const path = stripLeadingSlash(file.path)
    if (path === folderKey || path.startsWith(nested)) {
      bytes += file.size
      count += 1
    }
  }
  return { bytes, count }
}

export function pathsUnderFolder<T extends { path: string }>(
  files: T[],
  prefix: string,
  folderName: string,
): string[] {
  const nested = nestedPrefix(prefix, folderName)
  const folderKey = nested.slice(0, -1)
  const paths: string[] = []
  for (const file of files) {
    const path = stripLeadingSlash(file.path)
    if (path === folderKey || path.startsWith(nested)) {
      paths.push(file.path.startsWith("/") ? file.path : `/${path}`)
    }
  }
  return paths
}

export function prefixSegments(prefix: string): string[] {
  const p = normalizePrefix(prefix)
  return p ? p.slice(0, -1).split("/") : []
}

/** Backend listFolder prefix — absolute path segment like `/` or `/public/`. */
export function apiListFolderPrefix(prefix: string): string {
  const p = normalizePrefix(prefix)
  return p ? `/${p}` : "/"
}
