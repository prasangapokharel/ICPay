# Contributing to ICPay

Thanks for taking a look. ICPay moves real money on a public ledger, so the bar
for changes is higher than a typical side project — this document is about that
bar, not about ceremony.

## Before you start

For anything beyond a typo, open an issue first. A change that touches fund
movement, username ownership or the canister's stored state needs agreement on
the approach before code exists, because reverting a deployed canister upgrade
is not the same as reverting a commit.

## Setup

```bash
# backend
cd backend
dfx start --background
dfx deploy
bash scripts/run-tests.sh   # 24 tests, all must pass

# frontend
cd frontend
npm install
npm run dev
```

## The rules that matter

**Layering is not optional.** `api → services → repositories → storage`. API
modules take a `caller` and delegate; services hold business rules; repositories
own data structures. A repository never reaches into the ledger, and an API
module never contains a rule.

**Never widen fund access.** Every transfer and withdrawal derives its source
account from the `caller` — never from a parameter. This is the single property
that makes "no operator can move your funds" true. A patch that adds a source
account parameter, however convenient, will be rejected.

**Stored state is forever.** There is no migration story that deletes user data
and no delete endpoint. Adding a field to a persisted record is a permanent
commitment; think about it as such.

**Only official ICP ledger interfaces.** No hand-rolled ICRC-1 encoding.

## Frontend

- Next.js App Router with `output: "export"` — there is no server, so nothing may
  depend on one.
- Data reads go through SWR hooks in `hooks/use-wallet-data.ts`. Reuse them
  rather than calling services directly from a component; the caching rules there
  exist because update calls on the IC are slow and cost cycles.
- Comments explain *why*, not *what*. If removing a comment would not confuse a
  reader, do not write it.

## Verifying your change

```bash
cd frontend
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint services hooks components app --ext .ts,.tsx
npm run build

cd ../backend
bash scripts/run-tests.sh
```

The lint baseline is 5 pre-existing errors. Your change must not raise that
count.

## Commits and pull requests

Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`). Say *why* in the
body, not what the diff already shows.

In the PR, describe what you changed, how you verified it, and — if it touches
money, usernames or stored state — what you considered and rejected.

## Security

Do not open a public issue for a vulnerability that puts funds at immediate risk
without weighing the disclosure. See [SECURITY.md](SECURITY.md).

## License

Contributions are licensed under [MIT](LICENSE), the same as the project.
