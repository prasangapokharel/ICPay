import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const screenHeight = Dimensions.get('window').height
  const maxHeight = screenHeight * 0.9
  const offscreen = screenHeight

  const [visible, setVisible] = useState(open)
  const translateY = useRef(new Animated.Value(offscreen)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  const closeWithAnimation = useCallback(() => {
    if (!dismissible) return
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: offscreen,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false)
      onOpenChange?.(false)
    })
  }, [dismissible, offscreen, onOpenChange, translateY, backdropOpacity])

  useEffect(() => {
    if (open) {
      setVisible(true)
      translateY.setValue(offscreen)
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start()
    } else if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: offscreen,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false)
      })
    }
  }, [open, visible, offscreen, translateY, backdropOpacity])

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          dismissible && g.dy > 5 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy)
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 80 || g.vy > 0.6) {
            closeWithAnimation()
            return
          }
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            mass: 0.7,
            useNativeDriver: true,
          }).start()
        },
      }),
    [dismissible, closeWithAnimation, translateY],
  )

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-black/60"
        >
          <Pressable
            className="flex-1"
            onPress={closeWithAnimation}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>

        <Animated.View
          className="rounded-t-3xl border-t border-border bg-background px-4 pt-2 shadow-2xl"
          style={{
            transform: [{ translateY }],
            maxHeight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {/* Draggable header area */}
          <View {...(dismissible ? pan.panHandlers : {})}>
            {dismissible ? (
              <View className="mb-2 h-7 items-center justify-center">
                <View className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
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
          </View>

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
