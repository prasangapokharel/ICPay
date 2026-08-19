import { LegalScreen, LEGAL_COPY } from '@/features/legal/legal-screen'

export default function AboutRoute() {
  return <LegalScreen {...LEGAL_COPY.about} />
}
