import { Screen } from '@/components/layout/screen'
import { IcpverseScreen } from '@/features/icpverse/icpverse-screen'

export default function IcpverseRoute() {
  return (
    <Screen scroll={false} className="pt-3">
      <IcpverseScreen />
    </Screen>
  )
}
