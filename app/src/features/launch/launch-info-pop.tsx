import { useState } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { AppIcon } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'

export function LaunchInfoPop({ body }: { body: string }) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setOpen(true)}
        className="ml-1 size-8 items-center justify-center"
      >
        <AppIcon name="info" size={16} />
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-8" onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}} className="max-w-64 rounded-2xl bg-foreground px-3.5 py-2.5">
            <Text className="text-[11px] leading-relaxed text-background">{body}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
