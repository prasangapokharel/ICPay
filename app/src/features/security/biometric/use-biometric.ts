import { useCallback, useEffect, useState } from 'react'
import { canUseBiometric, type BiometricCapabilities } from '@/features/security/biometric/biometric.types'
import { authenticateBiometric, getBiometricCapabilities } from '@/features/security/biometric/biometric.service'

const NONE: BiometricCapabilities = {
  hasHardware: false,
  isEnrolled: false,
  supportsFingerprint: false,
  supportsFace: false,
}

export function useBiometric() {
  const [caps, setCaps] = useState<BiometricCapabilities>(NONE)

  useEffect(() => {
    void getBiometricCapabilities().then(setCaps)
  }, [])

  const authenticate = useCallback((prompt: string, cancel: string) => authenticateBiometric(prompt, cancel), [])

  return {
    ...caps,
    available: canUseBiometric(caps),
    authenticate,
  }
}
