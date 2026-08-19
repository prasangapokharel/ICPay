import { useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import useSWRImmutable from 'swr/immutable'
import { useSWRConfig } from 'swr'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CountryFlag } from '@/components/i18n/country-flag'
import { AppIcon, type AppIconName } from '@/components/ui/app-icon'
import { useAuth } from '@/components/auth/auth-provider'
import { useLocale } from '@/components/i18n/locale-provider'
import { useTheme } from '@/components/theme/theme-provider'
import { useFiatCurrency } from '@/components/fiat/fiat-provider'
import { LOCALES } from '@/language/config'
import { CURRENCIES } from '@/lib/fiat/config'
import { getSettings, updateSettings } from '@/services/settings/settings'

const LEGAL: { href: string; key: 'about' | 'faq' | 'roadmap' | 'transparency' | 'terms' | 'privacy'; icon: AppIconName }[] = [
  { href: '/about', key: 'about', icon: 'about' },
  { href: '/faq', key: 'faq', icon: 'faq' },
  { href: '/roadmap', key: 'roadmap', icon: 'roadmap' },
  { href: '/transparency', key: 'transparency', icon: 'transparency' },
  { href: '/terms', key: 'terms', icon: 'terms' },
  { href: '/privacy', key: 'privacy', icon: 'privacy' },
]

let syncedRemoteSettings = false

export function SettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { logout, identity } = useAuth()
  const t = useTranslations('settings')
  const tt = useTranslations('theme')
  const tl = useTranslations('language')
  const tf = useTranslations('fiat')
  const { resolved, setTheme } = useTheme()
  const { locale, setLocale } = useLocale()
  const { currency, setCurrency } = useFiatCurrency()
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const principal = identity?.getPrincipal().toText()
  const { data: remote } = useSWRImmutable(principal ? (['settings', principal] as const) : null, () =>
    getSettings(identity),
  )
  const hydrated = useRef(false)
  const notifications = useRef(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!remote || syncedRemoteSettings) return
    syncedRemoteSettings = true
    hydrated.current = true
    notifications.current = remote.notifications
    if (remote.theme === 'light' || remote.theme === 'dark') setTheme(remote.theme)
  }, [remote, setTheme])

  const close = async (next: boolean) => {
    if (next || !hydrated.current || !identity) {
      setSaveError(null)
      onOpenChange(next)
      return
    }
    const theme = resolved
    if (theme === remote?.theme && locale === remote?.language) {
      onOpenChange(false)
      return
    }
    const result = await updateSettings(identity, {
      theme,
      language: locale,
      notifications: notifications.current,
    })
    if ('err' in result) {
      setSaveError(result.err)
      return
    }
    const key = principal ? (['settings', principal] as const) : null
    if (key) await mutate(key, result.ok, { revalidate: false })
    setSaveError(null)
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => void close(next)}
      title={t('sections.preferences')}
      description={t('preferencesDescription')}
    >
      {saveError ? (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      ) : null}

      <View className="mb-2 flex-row items-center gap-2">
        <AppIcon name="language" size={16} />
        <Text className="text-sm font-medium">{tl('label')}</Text>
      </View>
      <View className="mb-5 flex-row flex-wrap gap-2">
        {LOCALES.map((item) => (
          <Button
            key={item.code}
            variant={locale === item.code ? 'default' : 'outline'}
            size="icon"
            accessibilityLabel={item.label}
            className="size-11 overflow-hidden rounded-full"
            onPress={() => setLocale(item.code)}
          >
            <CountryFlag country={item.country} size={28} />
          </Button>
        ))}
      </View>

      <Text className="mb-2 text-sm font-medium">{tf('label')}</Text>
      <View className="mb-5 flex-row flex-wrap gap-2">
        {CURRENCIES.map((item) => (
          <Button
            key={item.code}
            variant={currency === item.code ? 'default' : 'outline'}
            size="sm"
            onPress={() => setCurrency(item.code)}
          >
            {item.code}
          </Button>
        ))}
      </View>

      <View className="mb-5 flex-row items-center gap-3 rounded-2xl border border-border px-4 py-3.5">
        <View className="size-9 items-center justify-center rounded-full bg-muted">
          <AppIcon name="theme" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-sm">{tt('label')}</Text>
          <Text className="text-xs text-muted-foreground">{tt('description')}</Text>
        </View>
        <Switch value={resolved === 'dark'} onValueChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
      </View>

      <Text className="mb-2 pt-1 text-sm font-semibold">{t('sections.legal')}</Text>
      <View className="overflow-hidden rounded-2xl border border-border">
        {LEGAL.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => {
              onOpenChange(false)
              router.push(item.href as never)
            }}
            className="min-h-11 flex-row items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
          >
            <AppIcon name={item.icon} size={16} />
            <Text className="flex-1 text-sm">{t(`items.${item.key}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Button
        variant="destructive"
        className="mt-5 w-full"
        onPress={async () => {
          onOpenChange(false)
          await logout()
          router.replace('/login')
        }}
      >
        {t('signOut')}
      </Button>
    </Sheet>
  )
}
