# Full directory tree

Copy this as a starting scaffold. Replace `<Domain>` with your feature names.

```
my-ic-app/
├── package.json
├── ci/
│   ├── cli.ts
│   ├── ascii.ts
│   ├── lib.ts
│   ├── backend/{test,build,deploy,rollback,hash,logs}.ts
│   ├── frontend/{build,deploy}.ts
│   ├── canister/{list,status,id,call,info}.ts
│   ├── cycles/{balance,address,convert,topup}.ts
│   └── ledger/{balance,transfer,history}.ts
│
├── backend/
│   ├── dfx.json
│   ├── canister_ids.json
│   ├── mops.toml
│   ├── scripts/run-tests.sh
│   ├── pkg/{errors,http,crypto,validate,time}/...
│   ├── src/
│   │   ├── main.mo
│   │   ├── types.mo
│   │   ├── api/v1/{Health,Auth,Users,<Domain>}.mo
│   │   ├── services/{AuthService,UserService,<Domain>Service}.mo
│   │   ├── repositories/{UserRepository,<Domain>Repository}.mo
│   │   ├── storage/{UserStorage,<Domain>Storage}.mo
│   │   ├── ledger/{LedgerClient,Account,Types}.mo
│   │   ├── validators/{AmountValidator,<Domain>Validator}.mo
│   │   ├── models/{User,Transaction}.mo
│   │   ├── migrations/Add<Thing>.mo
│   │   ├── config/Config.mo
│   │   ├── middleware/Auth.mo
│   │   └── utils/{Helpers,UUID}.mo
│   └── testing/
│       ├── integration/FullFlow.test.mo
│       └── services/<Domain>Service.test.mo
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (app)/{layout.tsx,page.tsx,<route>/page.tsx}
│   │   ├── (auth)/login/page.tsx
│   │   └── (legal)/{about,faq,terms,privacy}/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── auth/
│   │   └── <domain>/
│   ├── hooks/
│   │   ├── ui/
│   │   └── <domain>/use<Name>.ts
│   ├── services/
│   │   ├── client.ts
│   │   ├── icp.ts
│   │   └── <domain>/<domain>.ts
│   ├── lib/
│   │   ├── ui/utils.ts
│   │   └── <domain>/
│   └── public/.well-known/ii-alternative-origins
│
├── docs/
│   ├── command/README.md
│   └── icFrame/              ← you are here
│
└── .github/workflows/ci.yml
```

See [structure/backend.md](../structure/backend.md) and
[structure/frontend.md](../structure/frontend.md) for layer rules.
