import QRCode from 'react-native-qrcode-svg'
import { View } from 'react-native'
import { images } from '@/constants/images'

export function QrCodeView({
  value,
  size = 176,
  logo,
}: {
  value: string
  size?: number
  logo?: string
}) {
  if (!value) return null
  const mark = logo ? { uri: logo } : images.logo
  return (
    <View className="self-center overflow-hidden rounded-3xl border border-border/20 bg-white p-6 shadow-lg">
      <QRCode
        value={value}
        size={200}
        ecl="M"
        quietZone={2}
        backgroundColor="#ffffff"
        color="#111111"
        logo={mark}
        logoSize={Math.round(200 * 0.16)}
        logoMargin={2}
        logoBackgroundColor="#ffffff"
        logoBorderRadius={999}
      />
    </View>
  )
}
