import { useState } from 'react'
import { Image, Linking, Platform, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { FileIcon } from '@/features/bucket/file-icon'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { formatBytes, mapBucketError, optionalText } from '@/lib/bucket/bucket'
import { fileIconName } from '@/lib/bucket/file-kind'
import {
  ellipsizeFileName,
  downloadBlob,
  fetchBucketFileBlob,
  fileDisplayName,
  normalizePublicFileUrl,
  openOrDownloadFile,
} from '@/lib/bucket/file-preview'
import { copyText } from '@/lib/wallet-utils'
import type { FilePublic } from '@/services/bucket/types'

export function BucketFilePreviewSheet({
  bucketId,
  file,
  open,
  onOpenChange,
  onDelete,
}: {
  bucketId: string
  file: FilePublic | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (path: string) => Promise<string | null>
}) {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!file) return null

  const fileName = fileDisplayName(file.path, file.name)
  const publicRaw = optionalText(file.publicUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const isImage = file.contentType.startsWith('image/')
  const kind = fileIconName(file.contentType, file.path)

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const blob = await fetchBucketFileBlob({
        publicUrl,
        identity,
        bucketId,
        path: file.path,
        contentType: file.contentType,
      })
      if (publicUrl) await openOrDownloadFile(publicUrl, blob, fileName)
      else if (Platform.OS === 'web') downloadBlob(blob, fileName)
    } catch {
      setError(t('downloadFailed'))
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    const err = await onDelete(file.path)
    setDeleting(false)
    if (err) {
      setError(mapBucketError(err, (key) => t(key)))
      return
    }
    setConfirmDelete(false)
    onOpenChange(false)
  }

  return (
    <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(false)
          onOpenChange(next)
        }}
        title={ellipsizeFileName(fileName, 36)}
        description={`${formatBytes(file.size)} · ${file.contentType}`}
      >
        <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-muted">
          {isImage && publicUrl ? (
            <Image source={{ uri: publicUrl }} resizeMode="contain" style={{ height: 208, width: '100%' }} />
          ) : (
            <View className="h-36 items-center justify-center">
              <FileIcon name={kind} size={36} />
            </View>
          )}
        </View>
        {error ? (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {confirmDelete ? (
          <View className="gap-2">
            <Text className="text-center text-sm text-muted-foreground">
              {t('deleteFileBody', { name: ellipsizeFileName(fileName, 28) })}
            </Text>
            <Button className="w-full" variant="destructive" disabled={deleting} onPress={() => void handleDelete()}>
              {deleting ? `${t('delete')}…` : t('delete')}
            </Button>
            <Button className="w-full" variant="outline" disabled={deleting} onPress={() => setConfirmDelete(false)}>
              {tc('cancel')}
            </Button>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              accessibilityLabel={t('download')}
              disabled={downloading}
              onPress={() => void handleDownload()}
            >
              <FileIcon name="download" size={18} />
            </Button>
            {publicUrl ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  accessibilityLabel={copied ? tc('copied') : t('copyUrl')}
                  onPress={() => void handleCopy()}
                >
                  {copied ? <AppIcon name="check" size={18} /> : <FileIcon name="copy" size={18} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  accessibilityLabel={t('openInNewTab')}
                  onPress={() => void Linking.openURL(publicUrl)}
                >
                  <FileIcon name="view" size={18} />
                </Button>
              </>
            ) : null}
            <Button
              variant="destructive"
              size="icon"
              accessibilityLabel={t('delete')}
              disabled={deleting}
              onPress={() => setConfirmDelete(true)}
            >
              <FileIcon name="delete" size={18} />
            </Button>
          </View>
        )}
      </Sheet>
  )
}
