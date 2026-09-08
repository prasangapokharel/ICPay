export const TAB_ROOTS = ['/', '/icpverse', '/icpay/presale', '/transactions', '/settings'] as const

export function isTabRoot(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return (TAB_ROOTS as readonly string[]).includes(path)
}
