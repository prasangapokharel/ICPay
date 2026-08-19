# Project Agent Rules

This is the ICPay React Native app. It is a custodial ICP wallet. Funds are real.

Read this file first. Then read only the skill that matches the task under `skills/`.
The screen and canister map is `docs/app/react-native/appallapi.json`. Do not invent endpoints.

## Skills

| Skill | Read it when |
|---|---|
| `skills/coding-standards/SKILL.md` | Any TypeScript or naming change |
| `skills/architecture/SKILL.md` | New feature, folder, or module boundary |
| `skills/react-native/SKILL.md` | Screens, lists, platform APIs, styling |
| `skills/typescript/SKILL.md` | Types, unions, API shapes |
| `skills/components/SKILL.md` | Shared UI vs feature UI |
| `skills/state-management/SKILL.md` | Query cache, session, stores |
| `skills/api/SKILL.md` | Canister calls, ledgers, ICPSwap |
| `skills/forms-validation/SKILL.md` | Forms, schemas, input |
| `skills/navigation/SKILL.md` | Expo Router, tabs, auth gates |
| `skills/performance/SKILL.md` | Lists, images, re-renders, polling |
| `skills/security/SKILL.md` | Identity, keys, derivation origin, logging |
| `skills/testing/SKILL.md` | Tests for money, auth, transfers |
| `skills/accessibility/SKILL.md` | Labels, touch targets, contrast |

## Before creating code

1. Inspect existing architecture.
2. Reuse existing utilities, components, and services.
3. Check whether the functionality already exists.
4. Follow the feature-based architecture.
5. Do not duplicate business logic.
6. Use TypeScript strict mode.
7. Use camelCase for variables and functions.
8. Use PascalCase for components and types.
9. Use kebab-case for filenames.
10. Keep Expo Router files thin.
11. Keep the IC agent and actor centralized.
12. Call canister methods from `docs/app/react-native/appallapi.json` — never invent REST `/api/v1` routes against the Motoko backend.
13. Keep business logic inside features.
14. Use React Native Reusables for shared UI primitives.
15. Prefer named exports.
16. Avoid `any`.
17. Avoid unnecessary dependencies.
18. Avoid premature abstractions.
19. Do not modify unrelated files.
20. Run typecheck, lint, and relevant tests after changes.

## When implementing a feature

```text
Route
  ↓
Feature Screen
  ↓
Feature Components
  ↓
Feature Hooks
  ↓
Feature API
  ↓
Shared IC client (one agent, one actor)
```

Do not bypass architectural boundaries without a clear reason.

Before finishing, remove unused imports, dead code, temporary logs, and duplicated logic.

## Hard rules

- Never change `derivationOrigin`. It is permanently `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`.
- Never store private keys, seed phrases, or passwords. Auth is Internet Identity only.
- Prefer query calls. Never poll update calls. Never put an update in a keystroke `useEffect`.
- Do not call backend `getSwapQuote` on mobile. Quote via ICPSwap factory/pool queries.
- `getSettings` is an update. Cache it on device. Do not refetch on every focus.
- Identity lives in expo-secure-store. Never AsyncStorage for delegations.
