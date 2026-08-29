import { Screen } from '@/components/layout/screen'
import { ChannelScreen } from '@/features/community/channel-screen'

export default function ChannelRoute() {
  return (
    <Screen scroll={false}>
      <ChannelScreen />
    </Screen>
  )
}
