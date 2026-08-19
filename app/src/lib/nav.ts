export const TAB_ROOTS = ['/', '/icpverse', '/live', '/transfer', '/settings'] as const

export function isTabRoot(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return (TAB_ROOTS as readonly string[]).includes(path)
}
