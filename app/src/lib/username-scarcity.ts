// Mock scarcity data - in production, fetch from backend
export function getScarcityStats(usernameLength: number): {
  remaining: number
  viewedToday: number
  isRare: boolean
} {
  // These would come from your backend analytics
  const stats = {
    1: { remaining: 12, viewedToday: 45, isRare: true },
    2: { remaining: 89, viewedToday: 23, isRare: true },
    3: { remaining: 297, viewedToday: 12, isRare: true },
    4: { remaining: 1842, viewedToday: 8, isRare: false },
    5: { remaining: 999999, viewedToday: 3, isRare: false },
  }

  return stats[usernameLength as keyof typeof stats] || { remaining: 999999, viewedToday: 1, isRare: false }
}
