import { useEffect, useRef, useState } from 'react'
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LanguageSwitch } from '@/components/i18n/language-switch'
import { AppIcon, type AppIconName } from '@/components/ui/app-icon'
import { Typewriter } from '@/components/shared/typewriter'
import { MarketStats } from '@/features/auth/market-stats'
import { InternetIdentityModal } from '@/features/auth/internet-identity-modal'
import { AuthWaiting } from '@/features/auth/auth-waiting'
import { loginWithPopup, PopupBlockedError } from '@/services/auth/ii-popup'
import {
  createAuthSession,
  identityFromCallback,
  II_CALLBACK,
  loginWithNative,
  openAuthInBrowser,
  type AuthBridgeOptions,
} from '@/services/auth/ii-native'
import { authIcons, images, type OpenIdProvider } from '@/constants/images'
import { useTheme } from '@/components/theme/theme-provider'
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity'

const features: { icon: AppIconName; key: 'custodial' | 'passwords' | 'instant' }[] = [
  { icon: 'protect', key: 'custodial' },
  { icon: 'security', key: 'passwords' },
  { icon: 'instant', key: 'instant' },
]

const openIdProviders = [
  { id: 'google' as const, source: authIcons.google, invertDark: false },
  { id: 'apple' as const, source: authIcons.apple, invertDark: true },
  { id: 'microsoft' as const, source: authIcons.microsoft, invertDark: false },
] satisfies { id: OpenIdProvider; source: number; invertDark: boolean }[]

export function LoginScreen() {
  const { completeLogin, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iiOpen, setIiOpen] = useState(false)
  const [authOptions, setAuthOptions] = useState<AuthBridgeOptions | undefined>(undefined)
  const [browserSession, setBrowserSession] = useState<Ed25519KeyIdentity | null>(null)
  const pendingRef = useRef<Ed25519KeyIdentity | null>(null)
  const t = useTranslations('login')
  const tSettings = useTranslations('settings')
  const { resolved } = useTheme()

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const handle = (url: string | null) => {
      const session = pendingRef.current
      if (!session || !url?.startsWith(II_CALLBACK)) return
      pendingRef.current = null
      void identityFromCallback(url, session)
        .then(completeLogin)
        .catch((e) => setError(e instanceof Error ? e.message : t('genericError')))
        .finally(() => {
          setConnecting(false)
          setIiOpen(false)
        })
    }
    void Linking.getInitialURL().then(handle)
    const sub = Linking.addEventListener('url', ({ url }) => handle(url))
    return () => sub.remove()
  }, [completeLogin, t])

  if (isLoading || isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-muted/40">
        <Spinner />
      </View>
    )
  }

  const startLogin = (options?: AuthBridgeOptions) => {
    setError(null)
    setConnecting(true)
    setAuthOptions(options)
    if (Platform.OS === 'web' && !options?.openIdProvider && !options?.provider) {
      void runWebLogin()
      return
    }
    void runNativeLogin(options)
  }

  const runNativeLogin = async (options?: AuthBridgeOptions) => {
    const session = createAuthSession()
    pendingRef.current = session
    setBrowserSession(session)
    try {
      const identity = await loginWithNative(options, session)
      if (!identity) return
      pendingRef.current = null
      await completeLogin(identity)
    } catch (e) {
      setIiOpen(true)
      setError(e instanceof Error ? e.message : t('browserHint'))
    } finally {
      setConnecting(false)
    }
  }

  const runWebLogin = async () => {
    try {
      const identity = await loginWithPopup()
      if (!identity) {
        setConnecting(false)
        return
      }
      await completeLogin(identity)
    } catch (e) {
      setError(e instanceof PopupBlockedError ? e.message : t('genericError'))
    } finally {
      setConnecting(false)
    }
  }

  return (
    <View className="flex-1 items-center bg-background">
      <View className="relative w-full flex-1 overflow-hidden px-6 pb-10 pt-16">
        <Image
          source={images.connectBg}
          className="absolute inset-0"
          contentFit="cover"
          style={{ opacity: resolved === 'dark' ? 0.35 : 1 }}
        />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: resolved === 'dark' ? 'rgba(10,10,10,0.75)' : 'rgba(255,255,255,0.5)' }}
        />
        <View className="absolute top-4 right-4 z-10">
          <LanguageSwitch />
        </View>
        <ScrollView contentContainerClassName="flex-grow" showsVerticalScrollIndicator={false}>
          <View className="flex-1 items-center justify-center">
            <MarketStats />
            <Image source={images.logo} className="mt-6 size-24" contentFit="contain" />
            <Text className="mt-6 text-2xl font-bold tracking-tight">{t('heading')}</Text>
            <View className="mt-2 h-10">
              <Typewriter className="text-center text-sm text-muted-foreground" text={t('tagline')} />
            </View>
            <View className="mt-10 w-full gap-4">
              {features.map(({ icon, key }) => (
                <View key={key} className="flex-row items-start gap-3">
                  <View className="size-9 items-center justify-center rounded-full bg-primary">
                    <AppIcon name={icon} size={18} onColor />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium">{t(`features.${key}Title`)}</Text>
                    <Text className="text-xs text-muted-foreground">{t(`features.${key}Body`)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-10 gap-3">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              size="lg"
              className="w-full"
              disabled={connecting}
              onPress={() => startLogin()}
              accessibilityLabel={t('connect')}
            >
              {connecting ? t('connecting') : t('connect')}
            </Button>
            <Text className="text-center text-xs text-muted-foreground">{t('redirectNote')}</Text>
            {Platform.OS === 'web' ? null : (
              <Button
                variant="ghost"
                size="sm"
                className="self-center"
                disabled={connecting}
                onPress={() => {
                  setError(null)
                  const session = openAuthInBrowser(authOptions, pendingRef.current ?? createAuthSession())
                  pendingRef.current = session
                  setBrowserSession(session)
                  setError(t('browserHint'))
                }}
              >
                {t('openInBrowser')}
              </Button>
            )}
            <View className="items-center gap-2 pt-1">
              <Text className="text-xs text-muted-foreground">{t('orContinue')}</Text>
              <View className="flex-row gap-2">
                {openIdProviders.map(({ id, source, invertDark }) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={t(`openId.${id}`)}
                    disabled={connecting}
                    onPress={() => startLogin({ openIdProvider: id })}
                    className="size-11 items-center justify-center rounded-xl border border-border bg-background active:opacity-80"
                  >
                    <Image
                      source={source}
                      className="size-6"
                      contentFit="contain"
                      style={invertDark && resolved === 'dark' ? { tintColor: '#fff' } : undefined}
                    />
                  </Pressable>
                ))}
              </View>
              <Text className="text-center text-xs text-muted-foreground">{t('openIdNote')}</Text>
            </View>
            <Text className="text-center text-xs text-muted-foreground">
              {t('legalPrefix')} {t('legalTerms')} {t('legalAnd')} {t('legalPrivacy')}.
            </Text>
            <View className="flex-row justify-center gap-4">
              {(['about', 'faq', 'roadmap', 'transparency'] as const).map((key) => (
                <Pressable key={key} onPress={() => router.push(`/${key}` as never)}>
                  <Text className="text-xs text-muted-foreground underline">{tSettings(`items.${key}`)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      <AuthWaiting open={connecting && Platform.OS === 'web'} onCancel={() => setConnecting(false)} />
      {Platform.OS === 'web' ? null : (
        <InternetIdentityModal
          open={iiOpen}
          session={browserSession}
          options={authOptions}
          onClose={() => {
            setIiOpen(false)
            setConnecting(false)
          }}
          onError={(message) => {
            setError(message)
            setConnecting(false)
          }}
          onSuccess={async (identity) => {
            try {
              await completeLogin(identity)
            } catch (e) {
              setError(e instanceof Error ? e.message : t('genericError'))
            } finally {
              setConnecting(false)
            }
          }}
        />
      )}
    </View>
  )
}
