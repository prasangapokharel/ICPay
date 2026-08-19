import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { LOCALES, type Locale } from '@/language/config'
import { useLocale, useTranslations } from '@/components/i18n/locale-provider'
import { CountryFlag } from '@/components/i18n/country-flag'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale()
  const t = useTranslations('language')
  const [open, setOpen] = useState(false)
  const current = LOCALES.find((item) => item.code === locale) ?? LOCALES[0]

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={current.label}
        onPress={() => setOpen(true)}
        className="size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background"
      >
        <CountryFlag country={current.country} size={22} />
      </Pressable>
      <Sheet open={open} onOpenChange={setOpen} title={t('select')}>
        {LOCALES.map((item) => (
          <Pressable
            key={item.code}
            onPress={() => {
              setLocale(item.code as Locale)
              setOpen(false)
            }}
            className={cn(
              'mb-1 min-h-11 flex-row items-center gap-3 rounded-2xl px-3 py-2',
              item.code === locale ? 'bg-muted' : '',
            )}
          >
            <View className="size-8 items-center justify-center overflow-hidden rounded-full border border-border">
              <CountryFlag country={item.country} size={24} />
            </View>
            <Text className="flex-1 text-sm font-medium">{item.label}</Text>
            {item.code === locale ? <Text className="text-xs text-primary">●</Text> : null}
          </Pressable>
        ))}
      </Sheet>
    </>
  )
}
