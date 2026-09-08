import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { markPresaleGuideSeen } from '@/lib/icpay/presaleGuide'
import { images } from '@/constants/images'

const STEPS = [
  { titleKey: 'guideStep1Title', bodyKey: 'guideStep1Body', icon: 'shop' as const },
  { titleKey: 'guideStep2Title', bodyKey: 'guideStep2Body', icon: 'swap' as const },
  { titleKey: 'guideStep3Title', bodyKey: 'guideStep3Body', icon: 'username' as const },
  { titleKey: 'guideStep4Title', bodyKey: 'guideStep4Body', icon: 'icpay' as const },
]

export function PresaleGuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('buyIcpay')
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  const dismiss = () => {
    markPresaleGuideSeen()
    setStep(0)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && dismiss()} title={t('heroTitle')}>
      <View className="gap-5 pb-2">
        <View className="flex-row items-center gap-3">
          <View className="size-12 overflow-hidden rounded-full">
            <Image source={images.icpayToken} className="size-full" contentFit="cover" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold">{t('heroTitle')}</Text>
            <Text className="text-sm text-muted-foreground">{t('heroSubtitle')}</Text>
          </View>
        </View>
        <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
          <AppIcon name={current.icon} size={22} />
        </View>
        <View className="gap-2">
          <Text className="text-base font-semibold">{t(current.titleKey)}</Text>
          <Text className="text-sm leading-relaxed text-muted-foreground">{t(current.bodyKey)}</Text>
        </View>
        <View className="flex-row justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </View>
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={step === 0}
            onPress={() => setStep((s) => Math.max(0, s - 1))}
          >
            {t('guidePrevious')}
          </Button>
          {last ? (
            <Button className="flex-1" onPress={dismiss}>
              {t('guideStart')}
            </Button>
          ) : (
            <Button className="flex-1" onPress={() => setStep((s) => s + 1)}>
              {t('guideNext')}
            </Button>
          )}
        </View>
        <Pressable onPress={dismiss} className="items-center py-1">
          <Text className="text-xs text-muted-foreground">{t('guideClose')}</Text>
        </Pressable>
      </View>
    </Sheet>
  )
}
