import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { QrCodeView } from '@/components/shared/qr-code'
import { PremiumBadge } from '@/components/shared/premium-badge'

export function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const handle = username ?? ''
  const router = useRouter()

  return (
    <View className="flex-1 items-center gap-4 bg-background px-6 pt-16">
      <UserAvatar seed={handle} size={72} />
      <View className="flex-row items-center gap-1">
        <Text className="text-2xl font-bold">@{handle}</Text>
        <PremiumBadge name={handle} />
      </View>
      <QrCodeView value={`https://icpay.app/${handle}`} size={180} />
      <Button className="h-11 w-full" onPress={() => router.push('/login')}>
        Pay with ICPay
      </Button>
    </View>
  )
}
