---
name: react-native
description: React Native and Expo patterns for ICPay mobile — primitives, lists, platform APIs, NativeWind, images. Use when writing screens or RN components.
---

# React Native Standards

Stack: Expo + Expo Router + TypeScript + React Native Reusables + NativeWind.

Use modern React Native and TypeScript patterns.

Prefer React Native primitives over platform-specific hacks.

Use: `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`, `SectionList`, `Image`, `TextInput`.

Avoid unnecessary third-party dependencies.

---

## Components

Components should have one responsibility.

```tsx
type UserAvatarProps = {
  uri?: string;
  size?: number;
};

export function UserAvatar({ uri, size = 40 }: UserAvatarProps) {
  return (
    <Image
      source={uri ? { uri } : undefined}
      style={{ width: size, height: size }}
    />
  );
}
```

Avoid giant components. If a screen becomes difficult to understand, extract feature components.

---

## Lists

Use FlatList or SectionList for dynamic lists. Do not render large collections with map + ScrollView.

```tsx
<FlatList
  data={users}
  keyExtractor={(user) => user.id}
  renderItem={({ item }) => <UserCard user={item} />}
/>
```

Always use stable keys. Never use array indexes when stable IDs exist.

---

## Platform differences

Use Platform APIs only when behavior genuinely differs.

```ts
import { Platform } from 'react-native';

const paddingTop = Platform.select({
  ios: 12,
  android: 8,
  default: 8,
});
```

Do not duplicate entire components for iOS and Android unnecessarily.

---

## Styling

Use NativeWind / React Native Reusables consistently. Do not mix StyleSheet, inline styles, and NativeWind for the same pattern without a reason.

Avoid inline styles for reusable design rules. Create reusable UI components for repeated patterns.

---

## Accessibility

Interactive elements must have accessible labels. Do not rely only on icons to communicate actions.

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Send payment"
>
  <Text>Send</Text>
</Pressable>
```

---

## Images

Use appropriate image dimensions and caching. Do not load unnecessarily large assets. Prefer optimized assets and remote image caching where appropriate.

---

## ICPay mobile

- QR for deposits: a dedicated RN QR library, not a web canvas.
- Internet Identity: AuthClient / native II WebView with `derivationOrigin`.
- Deep links: `icpay.app/[username]` and payment links.
- Legal pages: bundled markdown or a WebView. No canister calls.
- Bottom tabs: home, icpverse, buy username (center), transfer, menu.
