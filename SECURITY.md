# Security Policy

ICPay is a custodial wallet holding real ICP. It has **not been independently
audited**.

## Reporting a vulnerability

Report at [GitHub issues](https://github.com/prasangapokharel/ICPay/issues).

There is no private disclosure channel and no bug bounty. **An issue is public
the moment you file it.** If your finding would let someone drain or freeze user
funds, please weigh that before posting a working exploit — a description of the
class of bug and the affected file is enough to start, and details can follow
once a fix is deployed.

Expect a response within a few days. This is a solo project, not a staffed
security team.

## Scope

In scope:

- The backend canister (`backend/src`) — anything that moves funds, assigns
  usernames, or lets one caller act as another.
- The frontend (`frontend/`) — anything that misrepresents a destination or
  amount before a user confirms.

Known and accepted, so not worth reporting:

- A single principal controls the canister and can upgrade it. This is disclosed
  on the [Transparency page](https://ic-pay.vercel.app/transparency).
- Usernames, display names, transfer memos and the user directory are public and
  permanent. This is by design and documented in the Privacy Policy.
- Transfers are irreversible.
- The Vercel-hosted frontend is a conventional web host and sees your IP.

## What ICPay never handles

ICPay never receives, stores or transmits a private key, seed phrase or
password. Authentication is Internet Identity only. Any report claiming ICPay
leaked a key is describing something that does not exist in the codebase —
though a report that ICPay *asks* for one would be a critical finding, since it
would mean a compromised frontend.
