import { ScrollView, View } from 'react-native'
import { Text } from '@/components/ui/text'

export function LegalScreen({ title, body }: { title: string; body: string }) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-10 pt-2">
      <Text className="text-xl font-bold tracking-tight">{title}</Text>
      <Text className="text-sm leading-relaxed text-muted-foreground">{body}</Text>
    </ScrollView>
  )
}

export const LEGAL_COPY: Record<string, { title: string; body: string }> = {
  about: {
    title: 'About ICPay',
    body: 'ICPay is an open-source ICP wallet that lets you send Internet Computer tokens to a username instead of a 63-character principal. Built on a canister, signed in with Internet Identity, no seed phrase.',
  },
  faq: {
    title: 'FAQ',
    body: 'Sign in with Internet Identity. Claim a username. Deposit ICP to your custodial subaccount. Send by @username, principal, or account ID. Queries are free; updates cost cycles.',
  },
  terms: {
    title: 'Terms of Service',
    body: 'ICPay is a custodial wallet. Funds sit in a per-user subaccount of the backend canister. Only your Internet Identity principal can move them. Use at your own risk.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'We do not store passwords or seed phrases. Authentication is Internet Identity. On-chain data is public by nature of the Internet Computer.',
  },
  roadmap: {
    title: 'Roadmap',
    body: 'Mobile app, swap, usernames, ICPverse, analytics, token launch, and ICPay Cloud buckets. See icpay.app/roadmap for the live list.',
  },
  transparency: {
    title: 'Security & Transparency',
    body: 'The backend canister is on-chain and auditable. The module hash is the version marker. Never change derivationOrigin; it would strand funds.',
  },
}
