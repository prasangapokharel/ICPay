# Agents & skills structure

Optional but recommended for AI-assisted development. Keeps layering and naming
consistent across contributors and coding agents.

```
my-ic-app/
├── AGENTS.md                     # root project map (what/where/commands)
│
├── backend/.agents/
│   ├── SKILLS.md                 # index + task router
│   ├── skills/
│   │   ├── integration-standard/SKILL.md
│   │   ├── layering/SKILL.md
│   │   ├── coding-standard/SKILL.md
│   │   ├── error-handling/SKILL.md
│   │   ├── testing-standard/SKILL.md
│   │   ├── migration/SKILL.md
│   │   ├── endpoints/SKILL.md
│   │   └── motok/                # Motoko reference docs
│   │       ├── writing-motoko/SKILL.md
│   │       ├── testing-motok/SKILL.md
│   │       ├── ledger-integration/SKILL.md
│   │       ├── internet-identity-auth/SKILL.md
│   │       ├── cycles-and-cost/SKILL.md
│   │       └── deploy-guide/
│   └── rules/                    # Cursor auto-applied (.mdc)
│       ├── layering.mdc
│       ├── coding-standard.mdc
│       ├── error-handling.mdc
│       ├── migrations.mdc
│       └── testing-standard.mdc
│
├── frontend/.agents/
│   ├── SKILLS.md
│   ├── skills/
│   │   ├── lib-standard/SKILL.md
│   │   ├── hooks-standard/SKILL.md
│   │   ├── services/SKILL.md     # or services.md in rules/
│   │   └── ui-components/SKILL.md
│   └── rules/
│       ├── lib-standard.mdc
│       ├── hooks-standard.mdc
│       ├── services.mdc
│       └── ui-components.mdc
│
└── .claude/skills/               # cross-repo skills (committed)
    ├── ic-backend/SKILL.md
    ├── ic-frontend/SKILL.md
    ├── ic-ops/SKILL.md
    └── ic-git/SKILL.md
```

---

## Skill file format

Each `SKILL.md` starts with YAML frontmatter:

```markdown
---
name: layering
description: Backend api → services → repositories → storage rules.
---

# Layering

Read before editing any `.mo` file under `backend/src/`.
...
```

---

## Task router (`SKILLS.md`)

The index tells agents which skill to read first:

| Task | Read first |
|---|---|
| New backend endpoint | `integration-standard` → `layering` → `endpoints` |
| Stable memory change | `migration` → `testing-standard` |
| New frontend page | `hooks-standard` → `lib-standard` → `ui-components` |
| Deploy to mainnet | `ic-ops` (root `.claude/skills/`) |

---

## Cursor rules (`.mdc`)

Short, auto-applied constraints:

```markdown
---
description: Enforce backend layering
globs: backend/src/**/*.mo
---

Read skills/layering/SKILL.md before editing.

- api/ delegates to services only
- No business logic in repositories
```

---

## What to commit

| Path | Typical choice |
|---|---|
| `.claude/skills/` | Tracked — agents get context on clone |
| `backend/.agents/skills/` | Tracked or local |
| `backend/.agents/rules/` | Tracked — Cursor picks them up |
| `/AGENTS.md` (root) | Often gitignored (machine-local map) |
| `.claude/settings.local.json` | Always local |

---

## Minimal starter set

If you only write three skills:

1. **layering** — backend call direction
2. **hooks-standard** — frontend folder layout
3. **ic-ops** — `npm run ci` safety (confirm, upgrade-only, cycles)

Everything else can grow as the project does.
