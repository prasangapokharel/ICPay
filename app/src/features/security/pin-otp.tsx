import { useRef } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export const PIN_LENGTH = 4

export function pinValid(value: string): boolean {
  return value.length === PIN_LENGTH
}

export function PinOtp({
  value,
  onChange,
  onComplete,
  autoFocus = true,
}: {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  autoFocus?: boolean
}) {
  const inputRef = useRef<TextInput>(null)
  const digits = value.replace(/\D/g, '').slice(0, PIN_LENGTH)

  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="relative self-center">
      <View className="flex-row gap-3">
        {Array.from({ length: PIN_LENGTH }, (_, index) => {
          const filled = digits.length > index
          const active = digits.length === index
          return (
            <View
              key={index}
              className={cn(
                'h-14 w-12 items-center justify-center rounded-xl border bg-input/30',
                active ? 'border-primary' : 'border-input',
              )}
            >
              <Text className="text-lg font-semibold">{filled ? '•' : ''}</Text>
            </View>
          )
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={digits}
        onChangeText={(next) => {
          const pin = next.replace(/\D/g, '').slice(0, PIN_LENGTH)
          onChange(pin)
          if (pin.length === PIN_LENGTH) onComplete?.(pin)
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={PIN_LENGTH}
        autoFocus={autoFocus}
        caretHidden
        className="absolute inset-0 opacity-0"
      />
    </Pressable>
  )
}
