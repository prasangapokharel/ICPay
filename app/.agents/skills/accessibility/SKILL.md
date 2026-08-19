---
name: accessibility
description: Accessibility rules for ICPay mobile — labels, roles, touch targets, dynamic type. Use when building interactive UI or reviewing screens.
---

# Accessibility

Every interactive element must be accessible.

Use `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, and `accessibilityState` when appropriate.

Do not make icon-only buttons without an accessible label.

Support dynamic text sizes where possible.

Maintain sufficient touch target sizes (minimum 44pt).

Do not communicate important information using color alone.

Test important flows with platform accessibility tools.

---

## ICPay screens

- Send, receive, withdraw, and swap confirms must name the action, token, and amount in the label.
- QR views need a textual address alternative (copyable).
- Tab bar items need labels, not icons alone.
- Loading and error states must be announced (`accessibilityLiveRegion` or equivalent).
- Disabled confirm buttons expose `accessibilityState={{ disabled: true }}`.
