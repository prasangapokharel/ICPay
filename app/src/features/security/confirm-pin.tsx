import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { verifyPin } from '@/features/security/app-lock/app-lock.service'
import { PinOtp, pinValid } from '@/features/security/pin-otp'

export function ConfirmPin({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const t = useTranslations('deviceSecurity')
  const tc = useTranslations('common')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (value: string) => {
    if (!pinValid(value) || busy) return
    setBusy(true)
    setError(null)
    const ok = await verifyPin(value)
    setBusy(false)
    if (!ok) {
      setPin('')
      setError(t('failed'))
      return
    }
    onVerified()
  }

  return (
    <View className="items-center gap-4 pt-1">
      <PinOtp
        value={pin}
        onChange={(next) => {
          setPin(next)
          setError(null)
        }}
        onComplete={(value) => void submit(value)}
      />
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      <Button className="w-full" disabled={busy || !pinValid(pin)} onPress={() => void submit(pin)}>
        {t('unlock')}
      </Button>
      <Button className="w-full" variant="outline" disabled={busy} onPress={onBack}>
        {tc('back')}
      </Button>
    </View>
  )
}
