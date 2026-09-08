import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrCodeView } from '@/components/shared/qr-code'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { copyText } from '@/lib/wallet-utils'

export function DepositAddressBlock({
  value,
  hint,
  logo,
}: {
  value: string
  hint: string
  logo?: string
}) {
  const t = useTranslations('deposit')
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isLong = value.length > 48
  const shown = expanded || !isLong ? value : `${value.slice(0, 26)}…${value.slice(-6)}`

  const handleCopy = async () => {
    await copyText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View className="items-center gap-4">
      <QrCodeView value={value} logo={logo} />
      <View className="w-full max-w-sm flex-row items-stretch overflow-hidden rounded-xl border border-border bg-muted/30">
        <Input
          value={shown}
          editable={false}
          multiline={expanded}
          className="min-h-11 flex-1 rounded-none border-0 bg-transparent font-mono text-xs"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('copyAddress')}
          onPress={() => void handleCopy()}
          className="w-11 items-center justify-center border-l border-border"
        >
          <AppIcon name={copied ? 'check' : 'copy'} size={16} />
        </Pressable>
      </View>
      {isLong ? (
        <Pressable onPress={() => setExpanded((v) => !v)} className="self-center">
          <Text className="text-xs text-primary underline">{expanded ? t('showLess') : t('showFull')}</Text>
        </Pressable>
      ) : null}
      <Text className="text-center text-[11px] text-muted-foreground">{hint}</Text>
    </View>
  )
}
