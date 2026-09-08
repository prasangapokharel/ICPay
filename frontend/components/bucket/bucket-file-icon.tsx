"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Csv01Icon,
  Doc01Icon,
  File01Icon,
  Folder02Icon,
  Image01Icon,
  MusicNote01Icon,
  Pdf01Icon,
  Ppt01Icon,
  TextFontIcon,
  Txt01Icon,
  Xls01Icon,
  Xml01Icon,
  Zip01Icon,
} from "@hugeicons/core-free-icons"
import { pathExtension } from "@/lib/bucket/allowedFiles"

const ICON_CLASS = "size-5 shrink-0 text-muted-foreground"

function iconForExtension(ext: string) {
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "gif":
    case "svg":
    case "avif":
    case "bmp":
    case "ico":
    case "tif":
    case "tiff":
    case "heic":
    case "heif":
      return Image01Icon
    case "pdf":
      return Pdf01Icon
    case "doc":
    case "docx":
    case "odt":
    case "rtf":
      return Doc01Icon
    case "xls":
    case "xlsx":
    case "ods":
      return Xls01Icon
    case "csv":
      return Csv01Icon
    case "ppt":
    case "pptx":
    case "odp":
      return Ppt01Icon
    case "txt":
    case "md":
      return Txt01Icon
    case "json":
    case "xml":
    case "yaml":
    case "yml":
    case "toml":
      return Xml01Icon
    case "zip":
    case "tar":
    case "gz":
    case "bz2":
    case "7z":
    case "rar":
      return Zip01Icon
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
    case "m4a":
    case "aac":
      return MusicNote01Icon
    case "ttf":
    case "otf":
    case "woff":
    case "woff2":
      return TextFontIcon
    default:
      return File01Icon
  }
}

export function BucketFolderIcon() {
  return (
    <HugeiconsIcon icon={Folder02Icon} className={ICON_CLASS} strokeWidth={1.75} />
  )
}

export function BucketFileIcon({ path }: { path: string }) {
  return (
    <HugeiconsIcon
      icon={iconForExtension(pathExtension(path))}
      className={ICON_CLASS}
      strokeWidth={1.75}
    />
  )
}
