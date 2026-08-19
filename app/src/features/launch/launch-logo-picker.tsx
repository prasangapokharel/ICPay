import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { FileIcon } from '@/features/bucket/file-icon'

export function LaunchLogoPicker({
  value,
  onChange: _onChange,
  disabled: _disabled,
}: {
  value: string | null
  onChange: (logo: string | null) => void
  disabled?: boolean
}) {
  const t = useTranslations('launch')
  return (
    <View className="w-24 items-center gap-1.5">
      <View className="size-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
        <View className="size-10 items-center justify-center rounded-xl bg-primary">
          <FileIcon name="addImage" size={20} onColor />
        </View>
      </View>
      <Text className="text-center text-[10px] leading-tight text-muted-foreground">
        {value ? t('logoRemove') : t('logoHint')}
      </Text>
    </View>
  )
}
