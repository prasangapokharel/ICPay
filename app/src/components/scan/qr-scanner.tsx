import { useTranslations } from '@/components/i18n/locale-provider'
import { Sheet } from '@/components/ui/sheet'
import { QrScanPanel } from '@/components/scan/qr-scan-panel'
import type { ScannedAddress } from '@/lib/icp-address'

export function QrScanner({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (hit: ScannedAddress, raw: string) => void
}) {
  const t = useTranslations('scan')
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('title')} description={t('description')}>
      {open ? (
        <QrScanPanel
          onScan={(hit, raw) => {
            onOpenChange(false)
            onScan(hit, raw)
          }}
        />
      ) : null}
    </Sheet>
  )
}
