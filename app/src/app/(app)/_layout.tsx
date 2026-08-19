import { Redirect, Slot, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/components/auth/auth-provider'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { useLiveRooms } from '@/hooks/use-live-rooms'
import { useUserSearch } from '@/hooks/use-wallet-data'

export default function AppGroupLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-muted/40">
        <Spinner />
      </View>
    )
  }

  if (!isAuthenticated) return <Redirect href="/login" />

  return (
    <View className="flex-1 bg-muted/40" style={{ paddingTop: insets.top }}>
      <View className="relative mx-auto w-full max-w-md flex-1 bg-background">
        <AppHeader />
        <WarmCache />
        <Slot />
        <BottomNav />
      </View>
    </View>
  )
}

function WarmCache() {
  useLiveRooms()
  useUserSearch('', 10)
  return null
}
