# ICPay mobile — agent map

React Native app for the ICPay custodial wallet. Same Motoko canister as the web app. Funds are real.

Read `.agents/AGENTS.md` first. Then read only the skill that matches the task.

Screen and canister map: `docs/app/react-native/appallapi.json`.

## Layout

```text
app/
├── .agents/
│   ├── AGENTS.md
│   └── skills/          # 13 skills — read before writing code
├── docs/                # local reference (API map, skill source)
├── src/                 # Expo app code (not scaffolded yet)
├── assets/
├── package.json
└── tsconfig.json
```

## Skills

| Skill | When |
|---|---|
| coding-standards | Any TS/TSX |
| architecture | New feature or folder |
| react-native | Screens, lists, platform APIs |
| typescript | Types, canister shapes |
| components | Shared UI vs feature UI |
| state-management | Query cache, session, stores |
| api | Agent, actor, query vs update |
| forms-validation | Forms and schemas |
| navigation | Expo Router, tabs, gates |
| performance | Lists, polling, images |
| security | II, derivation origin, storage |
| testing | Auth, transfers, money paths |
| accessibility | Labels, targets, a11y |

## Hard rules

- Never change `derivationOrigin` (`https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`).
- Never store private keys. Internet Identity only.
- Prefer queries. Never poll updates.
- Do not call backend `getSwapQuote` on mobile.
- One HttpAgent and one actor. Feature APIs wrap methods. No REST `/api/v1` against the canister.
