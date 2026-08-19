export type BiometricCapabilities = {
  hasHardware: boolean
  isEnrolled: boolean
  supportsFingerprint: boolean
  supportsFace: boolean
}

export function canUseBiometric(caps: BiometricCapabilities): boolean {
  return caps.hasHardware && caps.isEnrolled
}
