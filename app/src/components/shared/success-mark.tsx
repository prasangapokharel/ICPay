import { View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

export function SuccessMark({ size = 72 }: { size?: number }) {
  const inner = size * 0.72
  return (
    <View className="items-center justify-center rounded-full bg-success/10" style={{ width: size, height: size }}>
      <View
        className="items-center justify-center rounded-full bg-success shadow-sm"
        style={{ width: inner, height: inner }}
      >
        <Svg width={inner * 0.55} height={inner * 0.55} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="12" fill="transparent" />
          <Path
            d="M6.5 12.2L10.4 16l7.1-8.2"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  )
}
