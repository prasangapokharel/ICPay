import { Slot, useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

export default function LegalLayout() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Pressable onPress={() => router.back()} className="px-4 py-3">
        <Text className="text-sm text-primary">Back</Text>
      </Pressable>
      <Slot />
    </View>
  )
}
