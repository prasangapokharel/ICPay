import { createElement, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { FileIcon } from '@/features/bucket/file-icon'
import { LOGO_MAX_BYTES } from '@/lib/launch'

const SIZE = 128

async function toLogoDataUri(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('unsupported')
  const scale = Math.max(SIZE / bitmap.width, SIZE / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
  bitmap.close()
  const uri = canvas.toDataURL('image/png')
  if (uri.length > LOGO_MAX_BYTES) throw new Error('tooLarge')
  return uri
}

export function LaunchLogoPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null
  onChange: (logo: string | null) => void
  disabled?: boolean
}) {
  const t = useTranslations('launch')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onChange(await toLogoDataUri(file))
    } catch (err) {
      setError(err instanceof Error && err.message === 'tooLarge' ? t('logoTooLarge') : t('logoFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="w-24 items-center gap-1.5">
      <View className="relative size-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
        {value ? (
          <Image source={{ uri: value }} className="size-full" contentFit="cover" />
        ) : (
          <View className="size-10 items-center justify-center rounded-xl bg-primary">
            <FileIcon name="addImage" size={20} onColor />
          </View>
        )}
        {busy ? (
          <View className="absolute inset-0 items-center justify-center bg-background/70">
            <Spinner />
          </View>
        ) : null}
        {createElement('input', {
          type: 'file',
          accept: 'image/*',
          disabled: disabled || busy,
          'aria-label': t('logoLabel'),
          onChange: (event: { target: { files?: FileList | null; value: string } }) => {
            void pick(event.target.files?.[0])
            event.target.value = ''
          },
          style: {
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: disabled || busy ? 'not-allowed' : 'pointer',
            width: '100%',
            height: '100%',
          },
        })}
      </View>
      {value ? (
        <Pressable
          disabled={disabled || busy}
          onPress={() => {
            onChange(null)
            setError(null)
          }}
          className="min-h-8 items-center justify-center"
        >
          <Text className="text-xs text-muted-foreground">{t('logoRemove')}</Text>
        </Pressable>
      ) : (
        <Text className="text-center text-[10px] leading-tight text-muted-foreground">{t('logoHint')}</Text>
      )}
      {error ? <Text className="text-center text-xs text-destructive">{error}</Text> : null}
    </View>
  )
}
