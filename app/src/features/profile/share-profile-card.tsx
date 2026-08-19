import { useState } from 'react'
import { Platform, Share, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppIcon } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'
import { copyText } from '@/lib/wallet-utils'
import { profileUrlFor } from '@/lib/profile-url'

export function ShareProfileCard({ username }: { username: string }) {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const url = profileUrlFor(username)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleShare = async () => {
    const title = t('shareSheetTitle', { name: username })
    const text = t('shareSheetText', { name: username })
    try {
      await Share.share(
        Platform.OS === 'ios' ? { title, url, message: text } : { title, message: `${text}\n${url}` },
      )
    } catch {
      await handleCopy()
    }
  }

  return (
    <Card>
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-medium">{t('shareTitle')}</Text>
          <Text numberOfLines={1} className="font-mono text-xs text-muted-foreground">
            {url.replace(/^https?:\/\//, '')}
          </Text>
        </View>
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={tc('copy')}
          className="rounded-full"
          onPress={() => void handleCopy()}
        >
          <AppIcon name={copied ? 'check' : 'copy'} size={16} />
        </Button>
        <Button size="icon-sm" accessibilityLabel={tc('share')} className="rounded-full" onPress={() => void handleShare()}>
          <AppIcon name="share" size={16} onColor />
        </Button>
      </View>
    </Card>
  )
}
