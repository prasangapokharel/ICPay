# SECURITY.md

# Security Policy

This project is an Internet Computer (ICP) Wallet built with:

* Next.js
* Internet Identity
* Motoko
* ICP Ledger

The application follows a **Security by Default** and **Zero Trust** architecture.

Every component must assume that all external input is untrusted.

---

# Security Goals

Primary goals:

* Self-custody
* Zero Trust
* Least Privilege
* Defense in Depth
* Secure by Default
* Production Ready

If one component fails, user funds must remain safe.

---

# Authentication

Authentication uses **Internet Identity** only.

Supported:

* Internet Identity
* Principal Authentication

Not Supported:

* Passwords
* Email Login
* OAuth
* API Keys

One Principal equals one user.

Principal ownership must always be verified.

---

# Identity Rules

Every user has

* UUID
* Principal
* Username

Rules

* UUID never changes.
* Principal never changes.
* Username must be unique.
* Username lookup must never bypass authorization.

---

# Wallet Security

The application must never store:

* Private Keys
* Seed Phrases
* Recovery Phrases
* Wallet Passwords
* Mnemonics
* Session Secrets

Users always control their own identity.

Transactions are always authorized by the authenticated principal.

---

# Authorization

Every request must verify:

* Caller Principal
* Resource Ownership
* Permission

Users must never access:

* Other user profiles
* Other user transactions
* Other user settings
* Other user balances

Authorization must be checked inside the backend.

Never trust frontend permissions.

---

# Username Transfers

Transfers by username must follow:

Username

↓

Resolve User

↓

Resolve Principal

↓

Validate

↓

Ledger Transfer

Never trust usernames provided by clients.

Always resolve usernames server-side.

---

# Input Validation

Validate every request.

Examples:

* Username
* Principal
* Account Identifier
* Amount
* Memo
* Pagination
* Search
* Settings

Reject invalid input immediately.

---

# Ledger Security

Only use the official ICP Ledger interface.

Never:

* Invent ledger methods
* Modify ledger responses
* Cache ledger balances indefinitely

Ledger remains the source of truth.

---

# Transaction Security

Every transfer must verify:

* Caller
* Destination
* Amount
* Balance
* Ledger Response

Never process duplicate requests.

Never bypass validation.

---

# Stable Memory

Only store application data.

Never store:

* Secrets
* Credentials
* Private Keys
* Sensitive authentication data

Persist only required business data.

---

# API Security

Every public API must:

* Validate input
* Validate caller
* Return structured errors
* Never expose internal state

Unexpected failures must not reveal implementation details.

---

# Repository Rules

Repositories:

* Read
* Write
* Update
* Delete

Repositories must never contain:

* Validation
* Authorization
* Business Logic

---

# Service Rules

Services own:

* Business Logic
* Authorization
* Validation orchestration
* Ledger interaction

No other layer may implement business rules.

---

# Error Handling

Never expose:

* Internal stack traces
* Stable memory layout
* Internal IDs
* Debug information

Return clear, structured, user-safe errors.

---

# Logging

Never log:

* Principal secrets
* Internal credentials
* Environment variables
* Tokens
* Sensitive configuration

Logs should include:

* Timestamp
* Request ID
* Operation
* Result

---

# Rate Limiting

Protect expensive operations:

* Login
* Username lookup
* Deposit verification
* Withdraw
* Transfer
* Dashboard refresh

Reject abusive traffic.

---

# Replay Protection

Prevent:

* Duplicate transfers
* Duplicate withdrawals
* Duplicate deposit processing

Requests should be idempotent where appropriate.

---

# Upgrade Safety

Before every upgrade:

* Persist required state
* Validate migrations
* Verify stable memory

After every upgrade:

* Restore state
* Verify integrity
* Run smoke tests

No user data should be lost.

---

# Dependency Security

Use only trusted dependencies.

Regularly:

* Update packages
* Remove unused libraries
* Review changelogs

Prefer official Internet Computer libraries.

---

# Secure Coding Standards

Follow:

* SOLID
* DRY
* KISS
* Single Responsibility Principle
* Least Privilege

Avoid:

* Duplicate logic
* Large functions
* Global mutable state
* Hidden side effects

---

# Security Testing

Every release must verify:

* Authentication
* Authorization
* Username uniqueness
* Username resolution
* Deposit flow
* Withdraw flow
* Ledger transfers
* Stable memory persistence
* Upgrade safety

Attempt:

* Unauthorized access
* Invalid principals
* Invalid usernames
* Invalid amounts
* Replay attacks
* Integer overflow
* Malformed requests
* Concurrent requests

Every invalid operation must fail safely.

---

# Development Rules

Never disable:

* Authentication
* Authorization
* Validation

Never add test shortcuts to production code.

Never hardcode identities or permissions.

---

# Production Checklist

Before deployment verify:

* No debug code.
* No TODO security items.
* No hardcoded values.
* No development identities.
* No unused public methods.
* No failing tests.
* No compiler warnings.
* No duplicate logic.
* Stable memory verified.
* Upgrade path verified.

---

# Security Principles

1. Internet Identity is the only authentication method.
2. The authenticated Principal is the source of user identity.
3. Never store private keys or recovery phrases.
4. Validate every external input.
5. Authorize every request.
6. The ICP Ledger is the source of truth for transfers.
7. Use least privilege across all modules.
8. Keep business logic inside services only.
9. Fail securely rather than guessing.
10. Security always takes priority over convenience.
