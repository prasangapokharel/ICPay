import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { savePin, verifyPin } from '@/features/security/app-lock/app-lock.service'
import { PinOtp, pinValid } from '@/features/security/pin-otp'

type Phase = 'current' | 'next' | 'confirm'

export function SecurityPinSheet({
  open,
  mode,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  mode: 'set' | 'change'
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const t = useTranslations('deviceSecurity')
  const tc = useTranslations('common')
  const [phase, setPhase] = useState<Phase>(mode === 'change' ? 'current' : 'next')
  const [pin, setPin] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setPhase(mode === 'change' ? 'current' : 'next')
    setPin('')
    setNext('')
    setError(null)
  }, [open, mode])

  const label = phase === 'current' ? t('pinUnlock') : phase === 'next' ? t('pinNew') : t('pinConfirm')

  const advance = async (value: string) => {
    if (!pinValid(value) || busy) return
    setBusy(true)
    setError(null)
    if (phase === 'current') {
      const ok = await verifyPin(value)
      setBusy(false)
      if (!ok) {
        setPin('')
        setError(t('failed'))
        return
      }
      setPin('')
      setPhase('next')
      return
    }
    if (phase === 'next') {
      setBusy(false)
      setNext(value)
      setPin('')
      setPhase('confirm')
      return
    }
    if (value !== next) {
      setBusy(false)
      setPin('')
      setNext('')
      setPhase('next')
      setError(t('pinMismatch'))
      return
    }
    await savePin(value)
    setBusy(false)
    onOpenChange(false)
    onSaved()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'change' ? t('changePin') : t('setPin')}
      description={t('pinHint')}
    >
      <View className="items-center gap-4">
        <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
        <PinOtp
          key={phase}
          value={pin}
          onChange={(value) => {
            setPin(value)
            setError(null)
          }}
          onComplete={(value) => void advance(value)}
        />
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
        <Button className="w-full" variant="outline" disabled={busy} onPress={() => onOpenChange(false)}>
          {tc('cancel')}
        </Button>
      </View>
    </Sheet>
  )
}
