import { PublicLayout } from "@/components/public/layout"

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout variant="wide">{children}</PublicLayout>
}
