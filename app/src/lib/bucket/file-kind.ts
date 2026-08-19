import { pathExtension } from '@/lib/bucket/allowed-files'
import type { FileIconName } from '@/constants/file-icons'

const SHEETS = new Set(['csv', 'xls', 'xlsx', 'ods'])
const ARCHIVES = new Set(['zip', '7z', 'rar', 'gz', 'bz2', 'tar'])
const CODE = new Set(['json', 'xml', 'yaml', 'yml', 'py', 'js', 'ts', 'tsx', 'jsx'])
const DOCS = new Set(['txt', 'md', 'rtf', 'doc', 'docx', 'odt'])
const FONTS = new Set(['otf', 'ttf', 'woff', 'woff2'])
const VIDEO = new Set(['mov', 'mpg', 'mpeg', 'flv', 'mp4', 'webm', 'avi'])
const AUDIO = new Set(['ogg', 'mp3', 'wav', 'flac', 'm4a', 'aac'])

export function fileIconName(contentType: string, path?: string): FileIconName {
  const ext = path ? pathExtension(path) : ''
  const mime = contentType.toLowerCase()

  if (ext === 'heic' || ext === 'heif' || mime.includes('heic') || mime.includes('heif')) return 'heic'
  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf'
  if (SHEETS.has(ext) || mime.includes('csv') || mime.includes('spreadsheet') || mime.includes('excel')) return 'sheet'
  if (ARCHIVES.has(ext) || mime.includes('zip') || mime.includes('gzip') || mime.includes('compress') || mime.includes('tar')) {
    return 'archive'
  }
  if (VIDEO.has(ext) || mime.startsWith('video/')) return 'video'
  if (AUDIO.has(ext) || mime.startsWith('audio/')) return 'audio'
  if (FONTS.has(ext) || mime.startsWith('font/')) return 'font'
  if (CODE.has(ext) || mime.includes('json') || mime.includes('python') || mime.includes('javascript') || mime.includes('xml')) {
    return 'code'
  }
  if (ext === 'toml' || mime.includes('toml')) return 'config'
  if (mime.startsWith('image/')) return 'image'
  if (DOCS.has(ext) || mime.startsWith('text/')) return 'document'
  return 'document'
}
