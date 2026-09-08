import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ICPay Channels",
  description:
    "Discover public Internet Computer community channels on ICPay. Join with Internet Identity — no seed phrase required.",
}

// Outside (app): strangers and crawlers must reach /channels/{slug} without login.
export default function CommunityPublicLayout({ children }: { children: React.ReactNode }) {
  return children
}
