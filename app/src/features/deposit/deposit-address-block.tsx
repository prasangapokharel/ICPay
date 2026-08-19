import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { QrCodeView } from '@/components/shared/qr-code'
import { Text } from '@/components/ui/text'
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
    <View className="items-center gap-6">
      <QrCodeView value={value} logo={logo} />
      <View className="w-full gap-3">
        <View className="rounded-2xl border border-border/30 bg-card p-4">
          <Text className="mb-2 text-xs font-medium text-muted-foreground">{hint}</Text>
          <Text selectable className="font-mono text-sm leading-relaxed">
            {shown}
          </Text>
        </View>
        {isLong ? (
          <Pressable onPress={() => setExpanded((v) => !v)} className="self-center">
            <Text className="text-xs text-primary underline">{expanded ? t('showLess') : t('showFull')}</Text>
          </Pressable>
        ) : null}
        <Button size="lg" onPress={() => void handleCopy()}>
          {copied ? t('copied') : t('copyAddress')}
        </Button>
      </View>
    </View>
  )
}
