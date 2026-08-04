---
name: comments
description: Comment standards for this codebase — what comments are allowed, what to never write, and how to phrase them. Use whenever writing, editing, or reviewing code, or when deciding whether a comment is needed at all.
---

# Comment Standards

Write code that reads itself. Comments exist to explain **why**, never to
restate **what**. If a comment describes what the code does, delete the comment
and let the code speak.

## Golden rule

Before writing a comment ask:

1. Does it explain a non-obvious *why* (a decision, constraint, tradeoff)?
2. Would the code be confusing without it?

If the answer to both is **No**, do not write a comment.

## Always allowed

- Explain a **non-obvious decision or constraint** — e.g. why a value is hardcoded,
  why a network call is rate-limited, why a fallback exists.
- Reference an external contract the reader cannot see from the code —
  e.g. "Matches Config.ICP_FEE", "oklch values must mirror globals.css".
- Note a **gotcha** that would otherwise cost time — e.g. browser quirk,
  stack-context clipping, SWR caching behavior.
- Mark a deliberately empty hook or export with **one** short line.

## Never write

- **Restating the code.** `// increments count` next to `count++`. Bad.
- **Obvious intent.** `// add two numbers`, `// render the button`. Bad.
- **Long multi-line essays** (3+ lines) for something a one-liner or the code
  itself conveys.
- **Stale/duplicated comments.** Copying the same comment into 4 files — the
  constant/helper belongs in one shared location instead.
- **Commented-out code.** Delete it; git history is the backup.
- **Section banners** (`// === FORMS ===`) or decorative dividers.
- **Grammar filler** like `// Basically, this does...` or `// Note: ...` for trivia.
- **`TODO`/`FIXME`/`HACK`** without a linked issue or explicit owner context.

## Style

- One or two lines maximum for 95% of comments. Use `//`.
- For block explanations (`/* */`) reserve for multi-paragraph rationale, and
  keep them tight.
- Match the tone: factual, no apologies, no exclamations.
- If a comment survives longer than the code it describes, delete it.

## When refactoring

- Prefer extracting a well-named function over commenting a complex block.
  A good name is the best comment.
- Move duplicated constants/helpers to their shared home (`lib/wallet-utils.ts`)
  instead of repeating the same comment in every consumer.
- If a comment is needed in more than one place, it belongs on the shared
  definition, not on each call site.

## Checklist

- [ ] Comment explains **why**, not **what**
- [ ] 1–2 lines, never an essay
- [ ] No restatement of obvious code
- [ ] No commented-out code
- [ ] No duplicated comment across files
- [ ] No decorative banners or filler
