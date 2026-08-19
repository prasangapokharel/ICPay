import { Screen } from '@/components/layout/screen'
import { DashboardScreen } from '@/features/dashboard/dashboard-screen'

export default function HomeRoute() {
  return (
    <Screen>
      <DashboardScreen />
    </Screen>
  )
}
