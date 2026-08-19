import { Image } from 'expo-image'
import { Text } from '@/components/ui/text'
import { View } from 'react-native'

function flagEmoji(country: string) {
  return country
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

export function CountryFlag({ country, size = 22 }: { country: string; size?: number }) {
  return (
    <View className="items-center justify-center overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Text style={{ fontSize: size * 0.72, lineHeight: size }}>{flagEmoji(country)}</Text>
      <Image
        source={{ uri: `https://flagcdn.com/w80/${country.toLowerCase()}.png` }}
        style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  )
}
