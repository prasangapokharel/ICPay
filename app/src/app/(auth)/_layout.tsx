import { Slot } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AuthLayout() {
  const insets = useSafeAreaInsets()
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Slot />
    </View>
  )
}
