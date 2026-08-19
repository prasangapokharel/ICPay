import { Screen } from '@/components/layout/screen'
import { LiveRoomScreen } from '@/features/live/live-room-screen'

export default function LiveRoomRoute() {
  return (
    <Screen scroll={false}>
      <LiveRoomScreen />
    </Screen>
  )
}
