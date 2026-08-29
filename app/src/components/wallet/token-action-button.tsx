import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/text'
import { actionIcons } from '@/constants/images'

export function TokenActionButton({
  kind,
  label,
  onPress,
}: {
  kind: keyof typeof actionIcons
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-2 active:opacity-80"
    >
      <View className="size-11 items-center justify-center rounded-full bg-gray-800">
        <Image source={actionIcons[kind]} className="size-5" contentFit="contain" />
      </View>
      <Text className="text-[11px] font-medium text-muted-foreground">{label}</Text>
    </Pressable>
  )
}
