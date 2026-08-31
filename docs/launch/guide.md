# ICPay launch runbook

Everything needed to put ICPay on `icpay.app` without stranding user funds.

Run the steps in order. Step 2 must happen **before** step 4 — that ordering is
the whole point of this document.

---

## The one thing that can go wrong

Internet Identity derives a principal from the origin that asks for it. The same
II account on a new domain produces a **different principal — a different wallet
with a zero balance**, while the real funds stay locked under the old one.

`NEXT_PUBLIC_DERIVATION_ORIGIN` pins every deployment to one principal, but II
only honours it for domains listed in `.well-known/ii-alternative-origins`,
which it reads **from the asset canister**, not from Vercel.

So: publish the origin list on-chain first, point the domain at the app second.

Two rules that never change:

- **Never change `NEXT_PUBLIC_DERIVATION_ORIGIN`.** It is
  `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io` permanently. Changing it
  repoints every user.
- **`frontend/public/.well-known/ii-alternative-origins` and
  `ALTERNATIVE_ORIGINS` in `frontend/services/icp.ts` must stay identical.**
  II checks the first; the client gates on the second. A mismatch silently
  falls back to a per-domain principal.

---

## Addresses

| | |
|---|---|
| Backend canister | `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Frontend asset canister | `63dke-waaaa-aaaan-q6mvq-cai` |
| ICP ledger | `ryjl3-tyaaa-aaaaa-aaaba-cai` |
| Controller | `or2yr-zj6k5-5gi2u-qo3tj-5pyn6-lbgwr-gqgpq-ubmff-ih4t4-yopxz-lqe` |

---

## Step 1 — Verify before touching anything

```bash
cd frontend
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint services hooks components app --ext .ts,.tsx
npm run build 2>&1 | tail -20
```

`tsc` must exit 0. eslint reports **exactly 5** pre-existing errors — more than
that is a regression you introduced.

Confirm the domain is in both lists:

```bash
cd ..
cat frontend/public/.well-known/ii-alternative-origins
grep -A5 "ALTERNATIVE_ORIGINS" frontend/services/icp.ts
```

Both must contain `https://icpay.app` and `https://www.icpay.app`.

Backend tests, only if backend code changed:

```bash
cd backend && bash scripts/run-tests.sh
```

---

## Step 2 — Deploy the asset canister

Vercel redeploys itself on every push. **The canister does not.** This is why it
drifted a release behind while the Transparency page was linking users to it.

```bash
cd backend
dfx identity whoami          # must be the controller identity
bash scripts/deploy-frontend.sh
```

The script builds the export, deploys, then greps the live canister for the
legal copy and exits non-zero if it is missing.

Why the grep matters: a stale canister returns **200 on every path** because the
SPA fallback serves `index.html`. A status code proves nothing. Only the copy
does.

Manual check of the same thing:

```bash
curl -s https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io/terms.html | grep -c "Terms of Service"
curl -s https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io/.well-known/ii-alternative-origins
```

First must print `1` or more. Second must list `icpay.app`.

If cycles are low:

```bash
dfx canister --network ic status icp_wallet_frontend
dfx canister --network ic deposit-cycles 500000000000 icp_wallet_frontend
```

---

## Step 3 — Push to main

```bash
git push origin main
```

Vercel builds automatically. Confirm the commit hash on the Vercel Overview page
matches:

```bash
git rev-parse --short HEAD
```

---

## Step 4 — Buy and attach the domain

Buy `icpay.app` (~$15/yr). `.app` is on the HSTS preload list, so browsers refuse
to load it over plain HTTP — a real security property for a wallet, not branding.

In Vercel → **Domains**:

1. Add `icpay.app`
2. Add `www.icpay.app`, set it to redirect to the apex
3. Wait for both to show **Valid Configuration**

In Vercel → **Environment Variables**:

| Variable | Value | Action |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://icpay.app` | set/update |
| `NEXT_PUBLIC_DERIVATION_ORIGIN` | `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io` | **leave alone** |
| `NEXT_PUBLIC_IC_NETWORK` | — | leave alone |
| `NEXT_PUBLIC_WALLET_CANISTER_ID` | — | leave alone |

`SITE_URL` feeds `sitemap.ts`, `robots.ts` and the OG tags in `layout.tsx`. It is
a static export, so **env changes need a rebuild** — trigger a redeploy in Vercel
after saving, or the tags keep saying `vercel.app`.

---

## Step 5 — Verify the domain before announcing it

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://icpay.app
curl -s https://icpay.app/terms | grep -c "Terms of Service"
curl -s https://icpay.app/.well-known/ii-alternative-origins
curl -s https://icpay.app/robots.txt
```

Then the test that actually matters, in a browser:

1. Open `https://icpay.app`
2. Sign in with an **existing** II account that already holds a balance
3. Confirm the **balance and username are the same** as on `ic-pay.vercel.app`

**If the balance is empty or the username is gone, stop.** The origin is not
registered. Do not publicise the domain — go back to step 2 and confirm the
canister is serving the updated origins file.

---

## Step 6 — Release

```bash
git tag -a vX.Y.Z -m "vX.Y.Z — summary"
git push origin vX.Y.Z
```

Then create the GitHub Release from the tag, with notes drawn from `CHANGELOG.md`.

---

## Rollback

| Broken | Fix |
|---|---|
| Vercel build | Vercel → Deployments → **Instant Rollback** |
| Asset canister | `git checkout <good-sha> && bash backend/scripts/deploy-frontend.sh` |
| Domain resolving wrong | Remove the domain in Vercel; `ic-pay.vercel.app` keeps working |
| Users see empty wallets | Pull the domain immediately. Funds are not lost — they are under the canister principal and reappear once the origin list is correct. |

There is no rollback for a changed `NEXT_PUBLIC_DERIVATION_ORIGIN`. Do not
change it.

---

## Standing rules

- `ic-pay.vercel.app` stays live permanently. It is in the origins list, and
  removing it would strand anyone who bookmarked it.
- II caps `alternativeOrigins` at **10**. Currently 3. Do not spend the budget on
  preview deployments.
- Redeploy the canister on every frontend change, or the on-chain copy silently
  falls behind the site the Transparency page tells people to verify against.
