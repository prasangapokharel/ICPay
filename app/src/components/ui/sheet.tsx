import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

export function Sheet({
  open,
  onOpenChange,
  children,
  dismissible = true,
  scroll = true,
  title,
  description,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  dismissible?: boolean
  scroll?: boolean
  title?: string
  description?: string
}) {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(0)).current
  const maxHeight = Dimensions.get('window').height * 0.88

  useEffect(() => {
    if (open) translateY.setValue(0)
  }, [open, translateY])

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => dismissible && g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy)
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 90 || g.vy > 0.9) {
            Animated.timing(translateY, {
              toValue: 520,
              duration: 180,
              useNativeDriver: true,
            }).start(() => onOpenChange?.(false))
            return
          }
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start()
        },
      }),
    [dismissible, onOpenChange, translateY],
  )

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (dismissible) onOpenChange?.(false)
      }}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => {
            if (dismissible) onOpenChange?.(false)
          }}
        />
        <Animated.View
          className="rounded-t-3xl border-t border-border bg-background px-4 pt-2"
          style={{
            transform: [{ translateY }],
            maxHeight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {dismissible ? (
            <View className="mb-2 h-8 items-center justify-center" {...pan.panHandlers}>
              <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </View>
          ) : (
            <View className="h-3" />
          )}
          {title ? (
            <Text className="px-2 text-center text-lg font-semibold" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text className="mt-1 text-center text-sm text-muted-foreground">{description}</Text>
          ) : null}
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName={title ? 'pt-4 pb-2' : 'pb-2'}
            >
              {children}
            </ScrollView>
          ) : (
            <View className={title ? 'pt-4 pb-2' : 'pb-2'}>{children}</View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
