# Public channel SEO — plan

Make **open, listed** ICPay channels discoverable on Google under stable URLs like
`https://icpay.app/channels/tron`. The in-app workspace stays auth-guarded; crawlers
get a public landing page with real metadata.

**Status:** planned — not implemented yet.

---

## Goal

| Target | URL | Indexed content |
|---|---|---|
| Channel landing | `/channels/{slug}` | Name, bio, member count, owner handle, join CTA |
| Directory (optional v2) | `/channels` public index | Paginated list of `#open` channels |
| Join link | `/channels/join/{slug}` | Same metadata + invite context; `noindex` if private |

**Out of scope for v1:** ranking individual chat messages (UGC, thin content, spam risk).

---

## Current blockers

| Issue | Where | Effect |
|---|---|---|
| Auth gate | `(app)/layout.tsx` → `AppAuthGate` | Googlebot redirected to `/login` |
| No metadata | `channels/[slug]/page.tsx` | Generic site title/description only |
| Client-only fetch | `useCommunityChannel` + `query()` | HTML has no channel data |
| `query()` requires II | `services/client.ts` | Throws without identity even though canister queries are public |
| Sitemap gap | `app/sitemap.ts` | No channel URLs |
| Robots gap | `app/robots.ts` | `/channels` not in allow list |

**Backend is ready.** `getCommunityChannel` and `listPublicCommunityChannels` are
free queries — no deploy needed for v1.

---

## Architecture

Two surfaces, one canonical URL:

```
Crawler / stranger          Logged-in user
        │                          │
        ▼                          ▼
  Public landing            App workspace
  (server metadata)         (full chat UI)
        │                          │
        └──── /channels/{slug} ────┘
              vercel rewrite → shell
```

Follow the **profile payment link** pattern (`(profile)/[username]`):
- Route lives **outside** `(app)/`
- `generateStaticParams` emits a placeholder shell (`slug`)
- `vercel.json` rewrite already maps `/channels/:slug` → `/channels/slug`
- Real slug read on client for app; server reads slug for metadata at build/request time

### Route layout (proposed)

```
frontend/app/
  (community-public)/          # new — no AppAuthGate
    channels/
      [slug]/
        page.tsx               # Server Component: generateMetadata + landing
        channel-landing.tsx    # Client: join CTA, link to app
      page.tsx                 # v2: public directory
  (app)/channels/              # unchanged — signed-in workspace
```

Keep `(app)/channels/*` for the wallet UI. Public landing is a **separate route group**
that shares components, not a refactor of the workspace.

---

## Implementation phases

### Phase 1 — Public reads (services)

Add anonymous query helpers using the existing `publicRead` pattern from
`services/icpay/sale.ts`:

```ts
// services/community/public.ts (or extend community.ts)
async function publicRead<T>(fn: ...) { return fn(await getWalletActor(undefined)) }

export async function getPublicCommunityChannel(slug: string)
export async function listPublicCommunityChannelsForSeo(limit, offset)
```

Rules:
- Use `getWalletActor(undefined)` — never `query()` from `client.ts`
- Only call query methods (`getCommunityChannel`, `listPublicCommunityChannels`)
- Return `null` for missing slug; caller decides 404 vs noindex

**Test:** unit test with mocked actor; no mainnet calls in CI.

### Phase 2 — SEO helpers (`lib/community/seo.ts`)

Pure functions — no canister I/O:

| Function | Output |
|---|---|
| `channelPath(slug)` | `/channels/{slug}` |
| `channelTitle(ch)` | `{name} — ICPay Channel` |
| `channelDescription(ch)` | bio or fallback from name + member count |
| `channelOgType()` | `"website"` |
| `isChannelIndexable(ch)` | `#open` visibility only |
| `channelJsonLd(ch)` | optional `Organization` / `WebPage` schema |

Indexability:
- **`#open`** → index, sitemap, allow robots
- **`#inviteOnly`** → `noindex`, omit from sitemap
- **Paid channels** → index landing (metadata); message preview off in v1

### Phase 3 — Public landing page

`app/(community-public)/channels/[slug]/page.tsx`:

```ts
export async function generateMetadata({ params }): Promise<Metadata>
export default function ChannelPublicPage()
```

`generateMetadata`:
1. Resolve slug from `params` (Next 16 async params)
2. `getPublicCommunityChannel(slug)`
3. If missing → `{ title: "Channel not found", robots: { index: false } }`
4. If invite-only → metadata OK for sharers, `robots: { index: false }`
5. Else → title, description, `alternates.canonical`, openGraph

Landing body (minimal HTML for crawlers):
- `<h1>{name}</h1>`
- `<p>{bio}</p>`
- Member count, owner `@handle`
- CTA: “Join with Internet Identity” → `/login?next=/channels/{slug}`
- Link: “Open in app” (same URL; app shell loads when authed)

Reuse presentational pieces from `community-channel-info.tsx` where possible;
extract a shared `CommunityChannelHeader` if needed.

### Phase 4 — Sitemap + robots

**`app/sitemap.ts`**
- At build time: paginate `listPublicCommunityChannelsForSeo` (limit 50, loop offset)
- Emit `{ url: /channels/{slug}, changeFrequency: "weekly", priority: 0.5 }`
- Cap: 500 channels (adjust when directory grows)

**`app/robots.ts`**
- Add `/channels` to `PUBLIC` allow list
- Do **not** add `/channels/new` or workspace-only paths
- Pattern `/channels/*` is allowed implicitly if `/channels` is public and landing pages are crawlable

### Phase 5 — App coexistence

No change to signed-in flow:
- `(app)/channels/[slug]` keeps `CommunityChannelScreen`
- Vercel rewrite serves **one** shell path; decide which page file owns `/channels/slug`

**Option A (recommended):** public page at `(community-public)/channels/[slug]` becomes the
rewrite target; it renders landing when logged out and redirects or embeds app chrome when
logged in.

**Option B:** keep rewrite → `(app)/channels/slug` but remove auth gate only for that segment
(harder — auth is on parent layout).

Prefer **Option A** — matches `(profile)` separation.

---

## Files to touch

| File | Change |
|---|---|
| `services/community/public.ts` | New — anonymous canister reads |
| `lib/community/seo.ts` | New — metadata helpers |
| `app/(community-public)/channels/[slug]/page.tsx` | New — metadata + landing |
| `app/sitemap.ts` | Channel URLs from public list |
| `app/robots.ts` | Allow `/channels` |
| `vercel.json` | Point rewrite to new shell if path changes |
| `testing/` or `frontend/**/*.test.ts` | Tests for seo helpers + public service |

**No backend changes** for v1.

---

## Metadata example (`/channels/tron`)

```ts
{
  title: "Tron — ICPay Channel",
  description: "Official Tron community on ICPay. 42 members. Join with Internet Identity.",
  alternates: { canonical: "/channels/tron" },
  openGraph: {
    title: "Tron on ICPay",
    description: "...",
    type: "website",
    url: "https://icpay.app/channels/tron",
  },
  robots: { index: true, follow: true },
}
```

Invite-only channel at same URL:

```ts
robots: { index: false, follow: false }
```

---

## What Google will and won't see

| Content | v1 | v2 (optional) |
|---|---|---|
| Channel name, bio, members | ✅ server HTML | ✅ |
| Owner username | ✅ | ✅ |
| Pinned message text | ❌ | maybe — if open + free |
| Message feed | ❌ | ❌ (stay client-only) |
| Paid channel messages | ❌ | ❌ |

Message indexing adds spam surface and duplicates Telegram/Discord — not worth it early.

---

## SEO expectations

| Query type | Realistic? |
|---|---|
| `icpay channels`, `icp community tron` | Yes — branded + long-tail |
| `tron crypto channel` | Maybe — needs unique bios + backlinks |
| Individual message URLs | No — not planned |

Channels are a **directory play**, not a chat SEO play.

---

## Verification checklist

Before marking done:

- [ ] `curl -s https://icpay.app/channels/tron` returns channel name in HTML (View Source)
- [ ] `<title>` and `og:title` match channel name
- [ ] Invite-only channel has `noindex`
- [ ] `/channels/tron` works logged out (no redirect to `/login`)
- [ ] Logged-in user still reaches full chat UI
- [ ] `sitemap.xml` lists open channels
- [ ] `robots.txt` allows `/channels`
- [ ] `./node_modules/.bin/tsc --noEmit` passes
- [ ] Tests for `lib/community/seo.ts` and public service mocks

**Manual:** Google Search Console → URL inspection after deploy.

---

## Risks

| Risk | Mitigation |
|---|---|
| Duplicate content (landing vs app) | Single canonical URL; same path, different chrome by auth |
| Slug squatting / offensive names | Existing validator; optional `noindex` admin flag later |
| Build-time sitemap stale | `revalidate` on Vercel deploy; weekly is enough for v1 |
| Static export (`ICP_STATIC_EXPORT=1`) | Metadata still works; sitemap uses build-time channel list. Vercel prod uses `ICP_STATIC_EXPORT=0`. |

---

## Effort

| Phase | Estimate |
|---|---|
| 1–2 Services + seo lib + tests | 0.5 day |
| 3 Public landing page | 1 day |
| 4 Sitemap + robots | 0.5 day |
| 5 App coexistence + QA | 0.5 day |
| **Total** | **~2.5 days** |

---

## References

- Backend API: `backend/docs/api/add/icCommunity/readme`
- Anonymous read pattern: `frontend/services/icpay/sale.ts`
- Profile public route: `frontend/app/(profile)/`
- Blog metadata pattern: `frontend/app/blog/*/page.tsx`
- Rewrites: `frontend/vercel.json` (`/channels/:slug`)
