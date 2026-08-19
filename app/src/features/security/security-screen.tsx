import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { AppIcon } from '@/components/ui/app-icon'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { useAppLock } from '@/features/security/app-lock'
import { hasPin } from '@/features/security/app-lock/app-lock.service'
import { SecurityPinSheet } from '@/features/security/security-pin-sheet'

export function SecurityScreen() {
  const t = useTranslations('deviceSecurity')
  const { onSend, setOnSend } = useAppLock()
  const [pinReady, setPinReady] = useState(false)
  const [pinMode, setPinMode] = useState<'set' | 'change'>('set')
  const [pinOpen, setPinOpen] = useState(false)
  const [pendingSend, setPendingSend] = useState(false)

  useEffect(() => {
    void hasPin().then(setPinReady)
  }, [])

  const toggleSend = (next: boolean) => {
    if (next && !pinReady) {
      setPendingSend(true)
      setPinMode('set')
      setPinOpen(true)
      return
    }
    setOnSend(next)
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>

      <View className="flex-row items-center gap-3 rounded-2xl border border-border/40 px-4 py-3.5">
        <View className="flex-1">
          <Text className="text-sm font-medium">{t('protectPayments')}</Text>
          <Text className="text-xs text-muted-foreground">{t('protectPaymentsHint')}</Text>
        </View>
        <Switch value={onSend} onValueChange={toggleSend} />
      </View>

      <Pressable
        onPress={() => {
          setPendingSend(false)
          setPinMode(pinReady ? 'change' : 'set')
          setPinOpen(true)
        }}
        className="min-h-11 flex-row items-center gap-3 rounded-2xl border border-border/40 px-4 py-3.5 active:bg-muted/30"
      >
        <View className="size-9 items-center justify-center rounded-full bg-muted">
          <AppIcon name="protect" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-sm">{pinReady ? t('changePin') : t('setPin')}</Text>
          <Text className="text-xs text-muted-foreground">{t('pinHint')}</Text>
        </View>
      </Pressable>

      <SecurityPinSheet
        open={pinOpen}
        mode={pinMode}
        onOpenChange={setPinOpen}
        onSaved={() => {
          setPinReady(true)
          if (pendingSend) setOnSend(true)
          setPendingSend(false)
        }}
      />
    </View>
  )
}
