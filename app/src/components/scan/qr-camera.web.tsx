import { createElement, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
}

export function QrCamera({
  onRaw,
  onError,
}: {
  onRaw: (raw: string) => void
  onError: (message: string) => void
}) {
  const t = useTranslations('scan')
  const host = useRef<HTMLDivElement | null>(null)
  const onRawRef = useRef(onRaw)
  const onErrorRef = useRef(onError)
  onRawRef.current = onRaw
  onErrorRef.current = onError

  useEffect(() => {
    const wrap = host.current
    if (!wrap || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      onErrorRef.current(t('errors.unsupported'))
      return
    }

    const video = document.createElement('video')
    video.setAttribute('playsinline', 'true')
    video.muted = true
    video.autoplay = true
    video.style.width = '100%'
    video.style.height = '100%'
    video.style.objectFit = 'cover'
    wrap.appendChild(video)

    let stream: MediaStream | null = null
    let timer = 0
    let stopped = false

    const tick = async (detector: Detector) => {
      if (stopped) return
      try {
        const codes = await detector.detect(video)
        const raw = codes[0]?.rawValue
        if (raw) {
          onRawRef.current(raw)
          return
        }
      } catch {
        // keep scanning
      }
      timer = window.setTimeout(() => void tick(detector), 250)
    }

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        video.srcObject = stream
        await video.play()
        const DetectorCtor = (
          window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => Detector }
        ).BarcodeDetector
        if (!DetectorCtor) {
          onErrorRef.current(t('errors.unsupported'))
          return
        }
        void tick(new DetectorCtor({ formats: ['qr_code'] }))
      } catch (err) {
        const name = err instanceof DOMException ? err.name : ''
        if (name === 'NotAllowedError') onErrorRef.current(t('errors.permission-denied'))
        else if (name === 'NotFoundError') onErrorRef.current(t('errors.no-camera'))
        else if (name === 'NotReadableError') onErrorRef.current(t('errors.in-use'))
        else onErrorRef.current(t('failed'))
      }
    })()

    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
      video.remove()
    }
  }, [t])

  return (
    <View className="h-64 overflow-hidden rounded-2xl bg-muted">
      {createElement('div', { ref: host, style: { width: '100%', height: '100%' } })}
    </View>
  )
}
