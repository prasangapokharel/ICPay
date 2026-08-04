# Security

ICPay is a **custodial** wallet. The canister holds user funds and moves them on
the user's behalf after Internet Identity proves who is calling. That design
buys usability — no seed phrase to lose, send money to `@alice` — and it costs
trust, because users are trusting the canister and whoever controls it.

This document says plainly what that trust currently rests on, including where
it is weaker than it should be.

## What the system never stores

- No private keys
- No seed or recovery phrases
- No passwords
- No email, no OAuth, no JWT inside the canister

Authentication is Internet Identity only. A user's principal *is* their
identity, and it never leaves their device. There is no credential in this
system that an attacker could steal from a user by breaching ICPay.

## How custody works

The canister owns one ledger account. Each user gets a **subaccount derived from
their principal**, so a user's balance is the ledger balance of
`{ owner = canister; subaccount = derive(principal) }`.

Derivation is one-way and deterministic. Two users can never collide, and the
caller's principal is what selects the subaccount — so a request can only ever
move the caller's own funds. Endpoints take the caller from the IC message, not
from a parameter; accepting a principal as an argument where the caller belongs
would be a critical bug, and reviews should treat it as one.

The ledger is the source of truth. Balances are read from it rather than
mirrored in canister state.

## Architecture as a safety property

The backend enforces a strict `API → Service → Repository → Storage` layering.
Calls only ever go downward. This is not style: it means every state change
passes through a service where validation lives, so there is one place to audit
rather than a dozen.

All input is validated (`backend/src/validators/`). Only official ICP ledger
interfaces are used — no hand-rolled ledger calls.

## Deployment controls

`main` is protected. No direct pushes, no force-push, no deletion. Every change
reaches production through a pull request with CI green: the full Motoko test
suite plus frontend typecheck, lint, and build.

**CI never deploys the canister.** That is deliberate. Automating the upgrade
would mean storing a key that can also *delete* the canister in a CI secret.
Shipping the backend is always a human running an explicit command, and that
command asks for typed confirmation before it touches mainnet.

Every mainnet write is confirmed interactively and refuses to run without a
terminal, so no script or scheduled job can trigger one.

Upgrades are reversible: the module hash is recorded before each deploy, and a
rollback rebuilds that exact revision and verifies the hash matches before
installing.

## Known weaknesses

Stating these plainly is more useful than a clean-looking list.

**Single controller.** The canister currently has one controller key. Whoever
holds it can upgrade the code — including to code that moves user funds — or
delete the canister outright. There is no multi-signature requirement and no
timelock. This is the largest risk in the project and it is not a code problem.

**Custodial by design.** Users do not hold keys to their funds. A compromise of
the controller is a compromise of every balance. Non-custodial mode is not on
the roadmap; it is a different product.

**No third-party audit yet.** The test suite covers the layers, but no external
party has reviewed the custody logic.

**Linear scans.** Some transaction lookups scan the full list. Correct today,
but a denial-of-service consideration as volume grows.

## Where this is going

Reducing controller risk is **Phase 6** of the roadmap:

- Move the controller to an SNS- or NNS-controlled canister, so no individual
  can unilaterally upgrade or delete it
- Reproducible builds, so anyone can verify the deployed hash matches this
  source
- Third-party audit
- A published incident policy and a private disclosure channel

Until that lands, the honest description is: **funds are as safe as the
operator's key.**

## Operating safely

For anyone running this — a fork, a staging copy, or this deployment.

### Controller keys

`dfx` writes identity keys to `~/.config/dfx/identity/<name>/identity.pem`. By
default that file is **not encrypted**. Create identities as
password-protected instead:

```bash
dfx identity new <name> --storage-mode password-protected
```

Never commit a `.pem`, never paste one into a chat or an issue, and never print
one to a terminal — scrollback and screenshots outlive the moment.

Back it up encrypted, and store the encrypted copy on separate physical media:

```bash
gpg --symmetric --cipher-algo AES256 \
  --output controller-key.pem.gpg \
  ~/.config/dfx/identity/<name>/identity.pem
```

Record the key's SHA-256 separately. A backup you have never restored is not a
backup — verify that decrypting reproduces the same checksum, and that importing
yields the expected principal.

### Add a second controller

A single controller means losing one machine loses the canister permanently.
Adding a second on **separate hardware** removes that single point of failure.

On the second machine:

```bash
dfx identity new backup-controller --storage-mode password-protected
dfx identity use backup-controller
dfx identity get-principal
```

The principal it prints is public and safe to share.

On the machine that already controls the canister:

```bash
export DFX_WARNING=-mainnet_plaintext_identity

dfx canister --network ic update-settings <backend-canister-id> \
  --add-controller <BACKUP_PRINCIPAL>

dfx canister --network ic update-settings <frontend-canister-id> \
  --add-controller <BACKUP_PRINCIPAL>
```

Do **both** canisters. Adding only the backend leaves you unable to ship the
frontend after a loss.

Use `--add-controller`. Never `--set-controller` — `set` *replaces* the whole
list, and running it with only the new principal locks out the original machine
immediately and irreversibly.

Verify:

```bash
dfx canister --network ic info <canister-id>
```

Both principals must be listed. Then prove the backup genuinely works, from the
second machine:

```bash
dfx identity use backup-controller
dfx canister --network ic status <canister-id>
```

`status` is a controller-only call. If it returns, that key has real control. If
it errors, fix it now — while the working key still exists.

Two controllers is redundancy against **loss**, not against **theft**: both keys
have full power. If one is suspected compromised, remove it from the other
machine:

```bash
dfx canister --network ic update-settings <canister-id> \
  --remove-controller <COMPROMISED_PRINCIPAL>
```

Only do that from a key you have already verified.

### Cycles

A canister at zero cycles is **deleted**, taking its state with it. Monitor the
balance, and understand that the freezing threshold reserves roughly 30 days of
idle burn — below that the canister stops accepting update calls before it dies.

### Tokens and credentials

Keep API tokens in the environment, never hardcoded in files that agents or
scripts read. Scope them to the minimum needed. Assume any token written into a
log, a session transcript, or a note is exposed, and rotate it rather than
attempting to delete every copy — revocation is the only reliable remedy.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report privately to the repository owner via GitHub. Include what you found, how
to reproduce it, and what an attacker could do with it. You will get an
acknowledgement, and credit if you would like it.

A formal disclosure policy and dedicated channel are part of Phase 6.
