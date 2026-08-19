# ICPay Backend (Motoko) — Agent Instructions

**Read [`/.agents/SKILLS.md`](.agents/SKILLS.md) first** — full skill index, rules, and task router.

| Task | Skill |
|---|---|
| **New feature (read first)** | [`.agents/skills/integration-standard/SKILL.md`](.agents/skills/integration-standard/SKILL.md) |
| Where to put code | [`.agents/skills/layering/SKILL.md`](.agents/skills/layering/SKILL.md) |
| Naming & style | [`.agents/skills/coding-standard/SKILL.md`](.agents/skills/coding-standard/SKILL.md) |
| Errors & `ApiResult` | [`.agents/skills/error-handling/SKILL.md`](.agents/skills/error-handling/SKILL.md) |
| Tests & CI | [`.agents/skills/testing-standard/SKILL.md`](.agents/skills/testing-standard/SKILL.md) |
| Upgrade / migration | [`.agents/skills/migration/SKILL.md`](.agents/skills/migration/SKILL.md) |
| New endpoint | [`.agents/skills/endpoints/SKILL.md`](.agents/skills/endpoints/SKILL.md) |
| Deploy & splits | [`.claude/skills/icpay-backend/SKILL.md`](../.claude/skills/icpay-backend/SKILL.md) |

Auto-applied rules: [`.agents/rules/`](.agents/rules/) — layering, coding-standard, error-handling, migrations, testing-standard. Manual: integration-standard for new features.

---

**Below is the original build spec**, written before the code existed. Useful for *intent*;
names like `ProfileRepository` were never built. **Where it disagrees with the code, the code wins.**

---

You are building the backend for an **ICP Wallet** using **Motoko**.

This is an **existing project**.

Do not redesign the architecture.

Follow the existing folder structure exactly.

The goal is to build a **minimal, production-quality, scalable ICP Wallet**.

---

# Authentication

Authentication must use **Internet Identity**.

Flow:

```text
Next.js

↓

Internet Identity (id.ai)

↓

Principal

↓

Actor

↓

Wallet Canister
```

Requirements

* No passwords
* No email login
* No OAuth
* No JWT inside the canister
* Principal is the user identity
* One Principal = One User

When a user logs in for the first time:

Automatically create a user profile.

---

# User Model

Every user must have:

```text
id (UUID)

principal

username

display_name

created_at

updated_at
```

Rules

* UUID is internal.
* Principal is immutable.
* Username is unique.
* Username can be changed only if available.
* Username is used for payments.
* Principal is never exposed when username is available.

Example

```
@john

@alice

@satoshi
```

---

# Username Payments

The wallet must support:

```
Send 1 ICP to @john
```

Flow

```text
User

↓

Lookup username

↓

Resolve Principal

↓

Resolve Account

↓

Ledger Transfer

↓

Create Transaction

↓

Success
```

The frontend never resolves usernames.

Only the backend can resolve usernames.

---

# Architecture

Follow the existing structure.

```
backend/src/

api/v1/
config/
dto/
ledger/
middleware/
migrations/
models/
repositories/
services/
storage/
testing/
types/
utils/
validators/
```

Never violate the architecture.

Flow

```
API

↓

Service

↓

Repository

↓

Storage
```

No business logic in API.

No business logic in Repository.

---

# Required APIs

Create clean modules.

```
api/v1/

auth/

dashboard/

users/

profile/

deposit/

withdraw/

transfer/

transactions/

settings/

health/
```

---

# Auth API

Responsibilities

* Login with Internet Identity
* Register first-time user
* Load current profile
* Verify Principal

---

# Dashboard API

Return

* User
* Username
* Principal
* ICP Balance
* Internal Balance (if applicable)
* Deposit Address
* Recent Transactions
* Statistics

---

# User API

Support

* Get current user
* Update username
* Check username availability
* Search username
* Resolve username → Principal

---

# Deposit API

Support

Generate deposit account/subaccount.

Verify Ledger deposits.

Store transaction.

Refresh dashboard.

---

# Withdraw API

Support

Withdraw ICP.

Validate balance.

Validate destination.

Transfer using ICP Ledger.

Return block index.

---

# Transfer API

Support

Transfer by

* Username
* Principal
* Account Identifier

Example

```
Transfer ICP

↓

@alice

↓

Resolve

↓

Ledger

↓

Success
```

---

# Transactions API

Support

* List
* Detail
* Pagination
* Explorer URL
* Status

---

# Settings API

Support

* Theme
* Language
* Notification preferences

Keep extensible.

---

# Services

Create

```
AuthService

DashboardService

UserService

DepositService

WithdrawService

TransferService

TransactionService

LedgerService

SettingsService
```

Only services contain business logic.

---

# Repository

Create

```
UserRepository

TransactionRepository

SettingsRepository

ProfileRepository
```

Repositories only access storage.

---

# Ledger

Create

```
LedgerClient

Balance

Transfer

Account

Subaccount
```

Use only the official ICP Ledger interfaces.

Never invent ledger APIs.

---

# Validators

Create

```
PrincipalValidator

UsernameValidator

AmountValidator

TransferValidator

AccountValidator
```

Everything must be validated.

---

# Storage

Storage is responsible only for persistence.

No validation.

No business logic.

---

# Models

Create only

```
User

Profile

Transaction

Transfer

Deposit

Withdrawal

Settings
```

Keep models small.

---

# Database / Stable Storage

Use stable canister storage.

Maintain normalized data.

User

↓

Transactions

↓

Settings

↓

Profile

No duplicated state.

---

# Security

Never store

* Private Keys
* Seed Phrase
* Recovery Phrase
* Password

Users authenticate only through Internet Identity.

Users always own their identity.

---

# Ledger

The Ledger is the source of truth.

Never duplicate Ledger balances unnecessarily.

Always verify transfers using the official ICP Ledger.

---

# Error Handling

Every API returns structured results.

Never trap expected failures.

Provide meaningful errors.

---

# Testing

Create tests for

* Internet Identity login
* First-time registration
* Username creation
* Username uniqueness
* Username lookup
* Username transfer
* Deposit
* Withdraw
* Ledger transfer
* Dashboard
* Transaction history
* Validation
* Upgrade persistence
* Failure scenarios

Every feature must include success and failure tests.

---

# Code Quality

Follow

* SOLID
* DRY
* KISS
* Small files
* Small functions
* Interface-oriented design
* Reusable utilities

Avoid duplicate logic.

---

# Final Review

Before completion, verify:

* Project compiles successfully.
* All tests pass.
* No duplicate code.
* No architecture violations.
* Username-based transfers work.
* Internet Identity authentication works.
* Deposit works.
* Withdraw works.
* Transfer by username works.
* Transaction history works.
* Dashboard updates correctly.
* Uses only official Internet Computer interfaces.
* Follows the existing folder structure exactly.

The implementation must be clean, minimal, scalable, production-ready, and easy to extend with future features such as ckBTC, ckETH, staking, and recurring payments.
