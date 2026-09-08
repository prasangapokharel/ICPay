import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { SearchInput } from '@/components/ui/search-input'
import { Text } from '@/components/ui/text'
import { AppIcon, type AppIconName } from '@/components/ui/app-icon'
import { SettingsDrawer } from '@/features/settings/settings-drawer'

type Item = {
  href?: string
  key: string
  icon: AppIconName
  keywords?: string
  onOpen?: () => void
  badge?: string
}

export function SettingsScreen() {
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations('settings')
  const router = useRouter()

  const sections: { key: string; items: Item[] }[] = [
    {
      key: 'premium',
      items: [
        { href: '/username', key: 'buyName', icon: 'username', keywords: 'premium identity handle' },
        { href: '/bucket/pricing', key: 'bucket', icon: 'bucket', keywords: 'storage cloud images cdn premium' },
        { href: '/launch', key: 'launch', icon: 'launch', keywords: 'create token icrc mint deploy premium' },
        { href: '/icpay', key: 'icpayToken', icon: 'icpay', keywords: 'icpay token presale' },
      ],
    },
    {
      key: 'money',
      items: [
        { href: '/wallet', key: 'tokens', icon: 'wallet', keywords: 'balance ckbtc holdings' },
        { href: '/deposit', key: 'deposit', icon: 'deposit', keywords: 'receive address qr' },
        { href: '/withdraw', key: 'withdraw', icon: 'withdraw', keywords: 'external send out' },
        { href: '/swap', key: 'swap', icon: 'swap', keywords: 'exchange trade icpswap convert' },
      ],
    },
    {
      key: 'identity',
      items: [
        { href: '/icpverse', key: 'icpverse', icon: 'icpverse' },
        { href: '/channels', key: 'community', icon: 'community', badge: 'communityBadge' },
        { href: '/live', key: 'live', icon: 'live' },
      ],
    },
    {
      key: 'activity',
      items: [
        { href: '/analytics', key: 'analytics', icon: 'analytics' },
        { href: '/transactions', key: 'history', icon: 'history' },
      ],
    },
    {
      key: 'more',
      items: [
        { href: '/security', key: 'security', icon: 'security', keywords: 'lock faceid fingerprint pin biometric' },
        { key: 'settings', icon: 'settings', onOpen: () => setDrawerOpen(true) },
      ],
    },
  ]

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter((i) =>
            `${t(`items.${i.key}`)} ${i.keywords ?? ''}`.toLowerCase().includes(needle),
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('searchPlaceholder')} />
      {visible.map((section) => (
        <View key={section.key} className="gap-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold">{t(`sections.${section.key}`)}</Text>
            {section.key === 'premium' ? (
              <View className="rounded-full bg-amber-400 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-white">PRO</Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row flex-wrap">
            {section.items.map((item) => (
              <Pressable
                key={`${section.key}-${item.key}`}
                onPress={() => (item.onOpen ? item.onOpen() : item.href && router.push(item.href as never))}
                className="mb-6 w-1/3 items-center gap-2 active:opacity-70"
              >
                <View className="relative size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/60 shadow-sm">
                  <AppIcon name={item.icon} size={24} />
                  {item.badge ? (
                    <View className="absolute -top-1.5 -right-1.5 rounded-md bg-amber-300 px-1.5 py-0.5">
                      <Text className="text-[9px] font-bold uppercase">{t(`items.${item.badge}`)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-center text-[11px] font-medium leading-tight">{t(`items.${item.key}`)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      {visible.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          {t('noMatch')} “{query.trim()}”.
        </Text>
      ) : null}
      <SettingsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </View>
  )
}
