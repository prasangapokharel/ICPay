import { Platform } from 'react-native'
import * as Linking from 'expo-linking'
import type { Identity } from '@icp-sdk/core/agent'
import { resolvePublicFileUrl, toRawCanisterUrl } from '@/lib/bucket/cdn'
import { downloadFileBlob } from '@/services/bucket/bucket'

export function normalizePublicFileUrl(url: string): string {
  return resolvePublicFileUrl(url, 'raw')
}

export function fileDisplayName(path: string, name?: string): string {
  return name || path.split('/').pop() || path
}

export function ellipsizeFileName(name: string, max = 32): string {
  if (name.length <= max) return name
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : ''
  const keep = Math.max(8, max - ext.length - 1)
  return `${name.slice(0, keep)}…${ext}`
}

export async function fetchBucketFileBlob(opts: {
  publicUrl: string | null
  identity: Identity | undefined
  bucketId: string
  path: string
  contentType: string
}): Promise<Blob> {
  const { publicUrl, identity, bucketId, path, contentType } = opts
  if (publicUrl) {
    const candidates = [toRawCanisterUrl(publicUrl), resolvePublicFileUrl(publicUrl, 'cdn')]
    for (const url of candidates) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const blob = await res.blob()
          if (blob.size > 0) return blob
        }
      } catch {
        // try next source
      }
    }
  }
  if (!identity) throw new Error('Download failed')
  const bytes = await downloadFileBlob(identity, bucketId, path)
  return new Blob([new Uint8Array(bytes)], { type: contentType })
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function openOrDownloadFile(url: string, blob: Blob, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadBlob(blob, filename)
    return
  }
  await Linking.openURL(url)
}
