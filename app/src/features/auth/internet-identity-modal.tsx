import { useMemo } from 'react'
import { Linking, Modal, View } from 'react-native'
import { WebView } from 'react-native-webview'
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity'
import type { Identity } from '@icp-sdk/core/agent'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { buildAuthBridgeUrl, identityFromCallback, II_CALLBACK, type AuthBridgeOptions } from '@/services/auth/ii-native'

type Props = {
  open: boolean
  session: Ed25519KeyIdentity | null
  options?: AuthBridgeOptions
  onClose: () => void
  onSuccess: (identity: Identity) => void
  onError: (message: string) => void
}

export function InternetIdentityModal({
  open,
  session,
  options,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const uri = useMemo(
    () => (session ? buildAuthBridgeUrl(session, options) : 'about:blank'),
    [open, session, options],
  )

  const intercept = async (url: string) => {
    if (!url.startsWith(II_CALLBACK)) return
    if (!session) return
    try {
      onSuccess(await identityFromCallback(url, session))
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not connect.')
    }
    onClose()
  }

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background pt-12">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <Text className="text-base font-semibold">Internet Identity</Text>
          <View className="flex-row gap-2">
            {session ? (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => void Linking.openURL(buildAuthBridgeUrl(session, options))}
              >
                Browser
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onPress={onClose}>
              Close
            </Button>
          </View>
        </View>
        <WebView
          source={{ uri }}
          javaScriptEnabled
          sharedCookiesEnabled
          setSupportMultipleWindows
          javaScriptCanOpenWindowsAutomatically
          originWhitelist={['https://*', 'http://*', 'icpay://*']}
          onShouldStartLoadWithRequest={(request) => {
            if (!request.url.startsWith(II_CALLBACK)) return true
            void intercept(request.url)
            return false
          }}
          startInLoadingState
        />
      </View>
    </Modal>
  )
}
