import { Image } from 'expo-image'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { images } from '@/constants/images'
import { ICP_LEDGER_ID, type TokenHolding } from '@/services/tokens'

export function TokenLogo({ token, size = 36 }: { token: TokenHolding; size?: number }) {
  const source = token.ledgerId === ICP_LEDGER_ID ? images.logo : token.logo ? { uri: token.logo } : null
  if (!source) {
    return (
      <View className="items-center justify-center rounded-full bg-muted" style={{ width: size, height: size }}>
        <Text className="text-[10px] font-bold uppercase text-muted-foreground">{token.symbol.slice(0, 2)}</Text>
      </View>
    )
  }
  return (
    <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="contain" />
  )
}
