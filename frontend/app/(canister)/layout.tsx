import { PublicLayout } from "@/components/public/layout"

export default function CanisterGroupLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout variant="wide">{children}</PublicLayout>
}
