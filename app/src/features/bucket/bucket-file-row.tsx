import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { FileIcon } from '@/features/bucket/file-icon'
import { Text } from '@/components/ui/text'
import { fileDisplayName, ellipsizeFileName, normalizePublicFileUrl } from '@/lib/bucket/file-preview'
import { fileIconName } from '@/lib/bucket/file-kind'
import { copyText } from '@/lib/wallet-utils'
import { formatBytes, optionalText } from '@/lib/bucket/bucket'
import type { FilePublic } from '@/services/bucket/types'

export function BucketFileRow({
  file,
  onPreview,
}: {
  file: FilePublic
  onPreview: (file: FilePublic) => void
}) {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const [copied, setCopied] = useState(false)
  const publicRaw = optionalText(file.publicUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const fileName = fileDisplayName(file.path, file.name)
  const kind = fileIconName(file.contentType, file.path)

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
      <Pressable
        onPress={() => onPreview(file)}
        className="size-10 items-center justify-center rounded-lg border border-border bg-muted"
      >
        <FileIcon name={kind} size={20} />
      </Pressable>
      <Pressable onPress={() => onPreview(file)} className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1} ellipsizeMode="middle">
          {ellipsizeFileName(fileName)}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {formatBytes(file.size)} · {file.contentType}
        </Text>
      </Pressable>
      {publicUrl ? (
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={copied ? tc('copied') : t('copyUrl')}
          onPress={() => void handleCopy()}
        >
          {copied ? <AppIcon name="check" size={16} /> : <FileIcon name="copy" size={16} />}
        </Button>
      ) : null}
    </View>
  )
}
