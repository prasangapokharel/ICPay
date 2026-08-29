import { PublicLayout } from "@/components/public/layout"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout variant="content">{children}</PublicLayout>
}
