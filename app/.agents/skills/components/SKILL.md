---
name: components
description: Component rules for ICPay mobile — React Native Reusables in components/ui, business UI inside features, composition and Hugeicons. Use when creating or moving UI.
---

# Component Standards

Use React Native Reusables for generic UI primitives when available.

Generic components belong in `components/ui/`.

```text
button.tsx
card.tsx
dialog.tsx
input.tsx
sheet.tsx
text.tsx
```

Business components belong inside their feature.

```text
features/transfer/components/transfer-form.tsx
features/dashboard/components/balance-card.tsx
```

Do not put business-specific components inside `components/ui`.

Shared layout lives in `components/layout/` (screen shell, keyboard view). Shared empty/error/loading lives in `components/feedback/`.

---

## Props

Keep props minimal.

```ts
type PaymentCardProps = {
  payment: Payment;
  onPress?: () => void;
};
```

Avoid passing large unrelated objects.

---

## Composition

Prefer composition over deeply configurable components.

```tsx
<Card>
  <CardHeader />
  <CardContent />
</Card>
```

Avoid components with dozens of boolean props.

Components render UI. Fetching and canister calls live in feature hooks, not leaf UI.

---

## Icons

Use `@hugeicons/react-native` only. No lucide, react-icons, or mixed icon sets.

Import named icons. Do not wildcard-import the pack.

Icon-only buttons need `accessibilityLabel`. Decorative icons get `accessibilityElementsHidden`.
