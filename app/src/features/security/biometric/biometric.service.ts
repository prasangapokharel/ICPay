import { Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { canUseBiometric, type BiometricCapabilities } from '@/features/security/biometric/biometric.types'

const NONE: BiometricCapabilities = {
  hasHardware: false,
  isEnrolled: false,
  supportsFingerprint: false,
  supportsFace: false,
}

export async function getBiometricCapabilities(): Promise<BiometricCapabilities> {
  if (Platform.OS === 'web') return NONE
  try {
    const [hasHardware, isEnrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ])
    return {
      hasHardware,
      isEnrolled,
      supportsFingerprint: types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT),
      supportsFace: types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION),
    }
  } catch {
    return NONE
  }
}

export async function authenticateBiometric(prompt: string, cancel: string): Promise<boolean> {
  const caps = await getBiometricCapabilities()
  if (!canUseBiometric(caps)) return false
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: cancel,
      biometricsSecurityLevel: 'strong',
      disableDeviceFallback: false,
    })
    return result.success
  } catch {
    return false
  }
}
