import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { Platform, View } from 'react-native'
import { getItem, setItem, subscribeKv } from '@/services/storage/kv'

const STORAGE_KEY = 'icpay:theme'
export type ThemeName = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: ThemeName
  resolved: 'light' | 'dark'
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolved: 'light',
  setTheme: () => {},
})

function getSnapshot(): ThemeName {
  const stored = getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function applyDomTheme(resolved: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  systemDark,
}: {
  children: ReactNode
  systemDark: boolean
}) {
  const theme = useSyncExternalStore(subscribeKv, getSnapshot, () => 'system' as ThemeName)
  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
  const setTheme = useCallback((next: ThemeName) => {
    setItem(STORAGE_KEY, next)
  }, [])
  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])

  useLayoutEffect(() => {
    applyDomTheme(resolved)
  }, [resolved])

  return (
    <ThemeContext.Provider value={value}>
      <View className={resolved === 'dark' ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext)
}
