import 'react-native-get-random-values'
import '../../global.css'

import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/components/auth/auth-provider'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { FiatProvider } from '@/components/fiat/fiat-provider'
import { ThemeProvider, useTheme } from '@/components/theme/theme-provider'
import { AppLockProvider } from '@/features/security/app-lock'
import { hydrateKv } from '@/services/storage/kv'
import { Spinner } from '@/components/ui/spinner'
import { View } from 'react-native'

const swrCache = new Map()
const swrDefaults = {
  provider: () => swrCache,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 3,
  dedupingInterval: 2_000,
}

export default function RootLayout() {
  const systemDark = useColorScheme() === 'dark'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void hydrateKv().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SWRConfig value={swrDefaults}>
        <ThemeProvider systemDark={systemDark}>
          <LocaleProvider>
            <FiatProvider>
              <AuthProvider>
                <AppLockProvider>
                  <RootNav />
                </AppLockProvider>
              </AuthProvider>
            </FiatProvider>
          </LocaleProvider>
        </ThemeProvider>
      </SWRConfig>
    </SafeAreaProvider>
  )
}

function RootNav() {
  const { resolved } = useTheme()
  return (
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(legal)" />
        <Stack.Screen name="(profile)" />
      </Stack>
    </>
  )
}
