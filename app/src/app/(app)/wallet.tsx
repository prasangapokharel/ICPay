import { Screen } from '@/components/layout/screen'
import { WalletScreen } from '@/features/wallet/wallet-screen'

export default function WalletRoute() {
  return (
    <Screen scroll={false}>
      <WalletScreen />
    </Screen>
  )
}
