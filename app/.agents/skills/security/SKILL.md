---
name: security
description: Security rules for the ICPay React Native wallet — Internet Identity, derivation origin, no keys, untrusted input. Use when touching auth, storage, QR, deep links, or logging.
---

# Security

This app holds real funds. Treat every change as production custody.

Never store secrets in source code.

Never commit `.env`, `.env.local`, private keys, mnemonics, API secrets, or access tokens.

Use expo-secure-store for the II identity delegation. Never AsyncStorage for credentials.

Never log passwords, private keys, recovery phrases, authentication tokens, or sensitive personal data.

Validate all external data. Treat API responses, deep links, QR codes, and user input as untrusted.

Do not trust client-side authorization. Authorization is enforced by the canister.

---

## ICPay hard rules

- Auth is Internet Identity only. Never store private keys, seed phrases, or passwords.
- `derivationOrigin` is permanently `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Changing it gives every user a different principal and strands their funds.
- NFID produces a different principal. Warn before connecting. Do not mix sessions.
- Do not log principals alongside amounts in debug builds that ship. Strip verbose agent logs from release.
- QR and payment-link payloads are untrusted. Parse, validate, then navigate. Never execute a transfer from a scanned payload without an explicit confirm screen.
- Bucket API keys are secrets. Show once. Store only if the user asks, and only in secure storage.
- Do not bypass the backend for transfers, withdraws, or swaps. The canister is custodian.
