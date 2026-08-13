/** Video extensions blocked client-side — keep in sync with backend FileValidator.mo BLOCKED. */
export const BLOCKED_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
  "flv",
  "wmv",
  "mpeg",
  "mpg",
  "3gp",
])

export const ALLOWED_EXTENSIONS = new Set([
  // Images
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
  "bmp",
  "ico",
  "tif",
  "tiff",
  "heic",
  "heif",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "csv",
  "rtf",
  "odt",
  "ods",
  "odp",
  // Code
  "js",
  "ts",
  "tsx",
  "jsx",
  "go",
  "rs",
  "py",
  "java",
  "kt",
  "swift",
  "php",
  "rb",
  "cpp",
  "c",
  "h",
  "hpp",
  "cs",
  "dart",
  "sh",
  "sql",
  "html",
  "css",
  "scss",
  "json",
  "xml",
  "yaml",
  "yml",
  "toml",
  // Archives
  "zip",
  "tar",
  "gz",
  "bz2",
  "7z",
  "rar",
  // Audio
  "mp3",
  "wav",
  "ogg",
  "flac",
  "m4a",
  "aac",
  // Fonts
  "ttf",
  "otf",
  "woff",
  "woff2",
  // Other
  "bin",
  "dat",
  "wasm",
])

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  js: "text/javascript",
  ts: "text/typescript",
  tsx: "text/typescript",
  jsx: "text/javascript",
  go: "text/x-go",
  rs: "text/x-rust",
  py: "text/x-python",
  java: "text/x-java",
  kt: "text/x-kotlin",
  swift: "text/x-swift",
  php: "application/x-php",
  rb: "application/x-ruby",
  cpp: "text/x-c++src",
  c: "text/x-c",
  h: "text/x-c",
  hpp: "text/x-c++src",
  cs: "text/x-csharp",
  dart: "application/dart",
  sh: "application/x-sh",
  sql: "application/sql",
  html: "text/html",
  css: "text/css",
  scss: "text/x-scss",
  json: "application/json",
  xml: "application/xml",
  yaml: "text/yaml",
  yml: "text/yaml",
  toml: "application/toml",
  zip: "application/zip",
  tar: "application/x-tar",
  gz: "application/gzip",
  bz2: "application/x-bzip2",
  "7z": "application/x-7z-compressed",
  rar: "application/vnd.rar",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
  bin: "application/octet-stream",
  dat: "application/octet-stream",
  wasm: "application/wasm",
}

export function pathExtension(pathOrName: string): string {
  const base = pathOrName.split("/").pop() ?? pathOrName
  const dot = base.lastIndexOf(".")
  if (dot < 0) return ""
  return base.slice(dot + 1).toLowerCase()
}

export function isBlockedExtension(ext: string): boolean {
  return BLOCKED_EXTENSIONS.has(ext.toLowerCase())
}

export function isAllowedExtension(ext: string): boolean {
  const e = ext.toLowerCase()
  if (!e || isBlockedExtension(e)) return false
  return ALLOWED_EXTENSIONS.has(e)
}

export function mimeFromExtension(ext: string): string | null {
  if (!isAllowedExtension(ext)) return null
  return EXT_TO_MIME[ext.toLowerCase()] ?? "application/octet-stream"
}

export function buildFileAcceptList(): string {
  // Picker hint only — not validation. Canister FileValidator.mo is authoritative.
  return "*/*"
}

const MIME_TO_EXT: Record<string, string> = {
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
}

/** Infer extension when iOS omits it from the filename. */
export function inferExtensionFromMime(mime: string): string | null {
  const type = mime.trim().toLowerCase()
  if (MIME_TO_EXT[type]) return MIME_TO_EXT[type]
  if (type.startsWith("image/")) {
    const sub = type.slice("image/".length)
    if (sub && !sub.includes("/")) return sub
  }
  return null
}

/**
 * iOS often returns HEIC photos with a missing or wrong extension.
 * Normalize before validation/compression so the pipeline can run.
 */
export function normalizeUploadFile(file: File): File {
  const ext = pathExtension(file.name)
  const inferred = !ext ? inferExtensionFromMime(file.type) : null

  if (!ext && inferred) {
    const stem = file.name.replace(/\.$/, "") || "photo"
    return new File([file], `${stem}.${inferred}`, {
      type: file.type || mimeFromExtension(inferred) || "application/octet-stream",
      lastModified: file.lastModified,
    })
  }

  // HEIC bytes sometimes arrive as IMG_1234.jpg on iOS
  if (
    (file.type === "image/heic" || file.type === "image/heif") &&
    ext !== "heic" &&
    ext !== "heif"
  ) {
    const stem = file.name.replace(/\.[^.]+$/, "") || "photo"
    const fixed = file.type === "image/heif" ? "heif" : "heic"
    return new File([file], `${stem}.${fixed}`, {
      type: file.type,
      lastModified: file.lastModified,
    })
  }

  return file
}

/**
 * Client-side pre-check only — size + blocked video extensions.
 * Does not use file.type. Backend validates bytes + extension on upload.
 */
export function isUploadCandidate(file: File, maxBytes: number): boolean {
  if (!file || file.size <= 0 || file.size > maxBytes) return false

  const ext = pathExtension(file.name)
  if (ext && isBlockedExtension(ext)) return false

  return true
}

export function guessFileMime(file: File): string {
  const ext = pathExtension(file.name)
  const fromExt = ext ? mimeFromExtension(ext) : null
  if (fromExt) return fromExt

  const type = file.type.trim().toLowerCase()
  if (type === "image/x-png") return "image/png"
  if (type === "image/jpg") return "image/jpeg"
  if (type.startsWith("image/")) return type
  if (type === "text/x-python" || type === "application/x-python-code") {
    return "text/x-python"
  }
  if (type === "application/x-zip-compressed") return "application/zip"
  if (type === "text/plain" || type === "application/zip") return type
  return type || "application/octet-stream"
}

export function isAllowedUpload(file: File, maxBytes: number): boolean {
  return isUploadCandidate(file, maxBytes)
}

export function fileTypeChip(contentType: string, path?: string): string {
  const ext = path ? pathExtension(path) : ""
  if (ext) return ext.toUpperCase().slice(0, 8)
  if (contentType.includes("webp")) return "WEBP"
  if (contentType.includes("png")) return "PNG"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "JPG"
  if (contentType.includes("gif")) return "GIF"
  if (contentType.includes("svg")) return "SVG"
  if (contentType.includes("pdf")) return "PDF"
  if (contentType.includes("python") || contentType.endsWith("py")) return "PY"
  if (contentType.includes("zip")) return "ZIP"
  if (contentType.includes("plain") || contentType.includes("text")) return "TXT"
  if (contentType.startsWith("image/")) return "IMG"
  if (contentType.startsWith("audio/")) return "AUDIO"
  if (contentType.startsWith("font/")) return "FONT"
  return "FILE"
}
