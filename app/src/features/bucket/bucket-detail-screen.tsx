import { useState } from 'react'
import { View } from 'react-native'
import { AppIcon } from '@/components/ui/app-icon'
import { FileIcon } from '@/features/bucket/file-icon'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { BucketFileRow } from '@/features/bucket/bucket-file-row'
import { BucketFilePreviewSheet } from '@/features/bucket/bucket-file-preview-sheet'
import { BucketApiKeysSheet } from '@/features/bucket/bucket-api-keys-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useBucketFiles, useBucketStats, useInvalidateBucketCache } from '@/hooks/use-bucket'
import { useRefreshWallet } from '@/hooks/use-wallet-data'
import { deleteFile, renewBucket } from '@/services/bucket/bucket'
import { formatBytes, isBucketActive, optionalText } from '@/lib/bucket/bucket'
import { normalizePublicFileUrl } from '@/lib/bucket/file-preview'
import { copyText, formatAmount } from '@/lib/wallet-utils'
import type { FilePublic } from '@/services/bucket/types'

export function BucketDetailScreen() {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const { id } = useLocalSearchParams<{ id: string }>()
  const bucketId = typeof id === 'string' ? decodeURIComponent(id) : ''
  const { identity } = useAuth()
  const { stats, isLoading, refresh } = useBucketStats(bucketId || null)
  const { files, refresh: refreshFiles } = useBucketFiles(bucketId || null, 0)
  const [renewOpen, setRenewOpen] = useState(false)
  const [keysOpen, setKeysOpen] = useState(false)
  const [preview, setPreview] = useState<FilePublic | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const refreshWallet = useRefreshWallet()
  const invalidate = useInvalidateBucketCache()

  if (isLoading || !bucketId) {
    return (
      <View className="gap-4 pt-2">
        <Skeleton className="h-24 w-full rounded-2xl" />
      </View>
    )
  }

  if (!stats) {
    return (
      <View className="gap-4 pt-2">
        <Alert variant="destructive">
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  const active = isBucketActive(stats.status)
  const publicRaw = optionalText(stats.publicBaseUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null

  const confirmRenew = async () => {
    setBusy(true)
    const result = await renewBucket(identity, bucketId)
    setBusy(false)
    if ('err' in result) return
    refreshWallet()
    await Promise.all([refresh(), invalidate()])
    setRenewOpen(false)
  }

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (path: string) => {
    const result = await deleteFile(identity, bucketId, path)
    if ('err' in result) return result.err
    await Promise.all([refresh(), refreshFiles(), invalidate()])
    return null
  }

  return (
    <View className="gap-4 pt-2">
      <View className="flex-row items-center gap-2">
        <Text className="min-w-0 flex-1 text-xl font-bold" numberOfLines={1}>
          {stats.name}
        </Text>
        <Button variant="outline" size="sm" onPress={() => setKeysOpen(true)}>
          {t('apiKeysShort')}
        </Button>
        <Button variant="outline" size="sm" onPress={() => setRenewOpen(true)}>
          {t('renew')}
        </Button>
      </View>
      <Text className="text-sm text-muted-foreground">
        {formatBytes(stats.storageUsed)} / {formatBytes(stats.capacity)} • {Number(stats.usagePercent)}%
      </Text>
      <Text className="text-xs text-muted-foreground">
        {active ? t('daysLeft', { days: Number(stats.daysRemaining) }) : t('expired')}
      </Text>
      {publicUrl ? (
        <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <Text className="min-w-0 flex-1 font-mono text-xs text-muted-foreground" numberOfLines={1} ellipsizeMode="middle">
            {publicUrl}
          </Text>
          <Button
            variant="outline"
            size="icon-sm"
            accessibilityLabel={copied ? tc('copied') : t('copyUrl')}
            onPress={() => void handleCopy()}
          >
            {copied ? <AppIcon name="check" size={16} /> : <FileIcon name="copy" size={16} />}
          </Button>
        </View>
      ) : null}
      <Text className="text-sm font-semibold">{t('files')}</Text>
      {files.length === 0 ? (
        <Text className="text-sm text-muted-foreground">{t('noFiles')}</Text>
      ) : (
        files.map((file) => <BucketFileRow key={file.id} file={file} onPreview={setPreview} />)
      )}
      <BucketFilePreviewSheet
        bucketId={bucketId}
        file={preview}
        open={preview !== null}
        onOpenChange={(next) => {
          if (!next) setPreview(null)
        }}
        onDelete={handleDelete}
      />
      <BucketApiKeysSheet bucketId={bucketId} open={keysOpen} onOpenChange={setKeysOpen} />
      <Sheet open={renewOpen} onOpenChange={setRenewOpen} title={t('renewTitle')} description={t('renewBody')}>
        <Text className="text-sm">{t('renewConfirm', { price: formatAmount(stats.renewPriceE8s) })}</Text>
        <Button className="mt-5 w-full" disabled={busy} onPress={() => void confirmRenew()}>
          {busy ? t('renewing') : t('renew')}
        </Button>
      </Sheet>
    </View>
  )
}
