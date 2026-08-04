# Adding a language

Everything you need is in `frontend/language/`. There is no route to add, no
middleware to touch, and no build config to change.

## The 15-minute version

1. Create `frontend/language/<code>/common.json` — copy `en/common.json` and
   translate the values. **Do not rename, add, or remove any keys.**
2. Add one line to `frontend/language/config.ts` → `LOCALES`.
3. Add one import + one map entry in
   `frontend/components/i18n/locale-provider.tsx`.
4. Run `node language/check.mjs` and `npm run typecheck`. Both must pass.

That is the whole job. Steps 2 and 3 are two lines each.

---

## Step 1 — the catalog

```bash
cd frontend
mkdir -p language/it
cp language/en/common.json language/it/common.json
```

Now translate the **values** in `language/it/common.json`. The **keys** are the
contract — they must match `en/common.json` exactly, or the app renders a raw
key like `settings.items.send` where the label should be.

`en/common.json` is the source of truth. Every other locale mirrors it.

### Placeholders

Some strings carry a value in braces:

```json
"promptBody": "Pick a free one of {min}+ characters and let people send you ICP."
```

`{min}` is substituted at runtime. **Keep it exactly as written** — same
spelling, same braces. You may move it anywhere in the sentence that reads
naturally in your language; word order does not need to match English.

### Things that are not translated

Leave these in Latin script: `ICP`, `ICPay`, `NFID`, `Internet Identity`,
`principal`, `QR`. They are product and protocol names. Translating them makes
the UI harder to search and support.

`ICPverse` is the exception: it sits in the bottom nav between four translated
labels, so a Latin word there reads as a missing translation rather than a brand
name. Transliterate it (`ICP 유니버스`, `ICPバース`, `आईसीपीवर्स`) and keep the
`ICP` part recognisable.

---

## Step 2 — register it

`frontend/language/config.ts`:

```ts
export const LOCALES = [
  { code: "en", label: "English", country: "US" },
  // ...
  { code: "it", label: "Italiano", country: "IT" },   // <- add
] as const
```

| Field | What it is | Rule |
|---|---|---|
| `code` | Directory name under `language/` | ISO 639-1, lowercase. Must equal the folder name. |
| `label` | Shown in the language picker | Write it **in that language** — `Italiano`, not `Italian`. A user looking for their language cannot read the English name for it. |
| `country` | Flag shown beside the label | ISO 3166-1 alpha-2, uppercase. |

The picker, the storage validation and the `Locale` type all read this array.
Nothing else needs to know a language was added.

---

## Step 3 — wire the messages

`frontend/components/i18n/locale-provider.tsx` — two lines:

```ts
import it from "@/language/it/common.json"        // <- add

const MESSAGES: Record<Locale, typeof en> = { en, hi, zh, ja, ko, es, fr, de, pt, ru, it }  // <- add
```

`Record<Locale, ...>` is deliberate: forgetting this line is a **compile
error**, not a blank screen at runtime.

Catalogs are imported statically rather than with dynamic `import()`. These are
small JSON files, and a static export has no server to stream them from — a
fetch-per-locale would buy a loading spinner and nothing else. If catalogs ever
grow past ~50 KB each, revisit this; below that, static wins.

---

## Step 4 — verify

Both commands run from `frontend/`.

**Key parity** — catches a missing or misspelled key in any locale:

```bash
node language/check.mjs
```

It reads the locale list straight out of `config.ts`, so a language added in
step 2 is checked automatically. Exits non-zero on drift:

```
ko  FAIL
  missing: dashboard.seeMore
  extra:   dashboard.bogus
```

**Types and build:**

```bash
./node_modules/.bin/tsc --noEmit
npm run build 2>&1 | tail -20
```

Then click through the picker in Settings → Preferences and confirm nothing
overflows. CJK is compact; Hindi, German and French run long and are the ones
that break a fixed-width button.

---

## Adding a *string* (not a language)

Different job. When you translate a new component:

1. Add the key to **`en/common.json` first** — it is the source of truth.
2. Add the same key to **every** other locale. Untranslated English text is
   better than a raw key on screen, so copy the English value if you have no
   translation yet.
3. In the component:

```tsx
"use client"
import { useTranslations } from "next-intl"

export function Thing() {
  const t = useTranslations("dashboard")   // namespace
  return <h2>{t("latestTransactions")}</h2>
}
```

With a value:

```tsx
t("promptBody", { min: USERNAME_FREE_MIN_LENGTH })
```

Keys are type-checked against `en/common.json`. A typo fails `tsc` — verified
by deliberately breaking one. You cannot ship a missing translation silently.

### Arrays of items

Store the message **key**, not the label, and resolve at render:

```tsx
const NAV = [{ href: "/", labelKey: "home", icon: Home01Icon }] as const
// ...
<NavTab label={t(item.labelKey)} />
```

Storing the label in a module constant freezes it at import time — the text
would not change when the user switches language.

Name the field `labelKey`, **not** `key`. `key` is reserved by React, and
spreading `{...item}` onto a component silently overwrites React's key with
your string. TypeScript catches this (TS2783), but the field name avoids it.

---

## How it works

- **No `/en/...` routes.** The frontend is `output: "export"` and fully
  client-rendered. Route-based i18n needs middleware, and there is no server.
  It would also multiply the static output by the number of locales.
- **Locale lives in `localStorage`** under `icpay:locale`, so URLs stay stable
  and switching is instant with no navigation.
- **Read via `useSyncExternalStore`**, not `useState` + `useEffect`. An effect
  would paint English and then flip to the stored language — a visible flash on
  every page load. It also keeps the `react-hooks/set-state-in-effect` lint
  count at its baseline of 5.
- **Other tabs stay in sync** via the `storage` event.

### Files

| File | Role |
|---|---|
| `language/config.ts` | `LOCALES`, `DEFAULT_LOCALE`, storage key, `isLocale` |
| `language/<code>/common.json` | One catalog per language |
| `language/check.mjs` | Key-parity check across all locales |
| `language/next-intl.d.ts` | Makes keys type-checked against `en` |
| `components/i18n/locale-provider.tsx` | Reads storage, provides messages |
| `components/i18n/language-select.tsx` | The picker in Settings |

---

## Gotchas

**English is not the fallback for a missing key.** next-intl renders the key
path itself. A key present in `en` but absent in `it` shows
`settings.items.send` to Italian users. This is why parity is checked.

**Flags are `svg` mode, not emoji.** Windows ships no colour flag glyphs — the
emoji path renders as two letter boxes there.

**A flag is a country, a locale is a language.** They do not map cleanly:
Spanish is not only Spain, Arabic is not only Saudi Arabia. The flag is a visual
aid; the `label` in the user's own language is what actually identifies it.

**RTL is not implemented.** Adding Arabic or Hebrew needs `dir="rtl"` on `<html>`
driven by the locale, plus an audit of every `left-`/`right-`/`ml-`/`mr-` class
for its logical equivalent. Budget real time for this — it is not a catalog
drop-in.

**Do not translate error strings from the canister.** Backend messages arrive in
English and are shown as-is. Translating them means mapping every backend error
to a key, which is a separate piece of work.
