import { getItem, setItem } from '@/services/storage/kv'

const GUIDE_KEY = 'icpay:presale-guide'

export function hasSeenPresaleGuide(): boolean {
  return getItem(GUIDE_KEY) === '1'
}

export function markPresaleGuideSeen(): void {
  setItem(GUIDE_KEY, '1')
}
