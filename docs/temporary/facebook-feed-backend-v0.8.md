# Facebook feed backend — temporary reference (v0.8)

> **Status:** temporary scratchpad for the **next PR** after the UI shell (`feature/actualites-feed-ui`).  
> **Not normative** — [project-spec.md](../../project-spec.md) and [project-roadmap.md](../../project-roadmap.md) remain authoritative.  
> **Delete or fold** into permanent docs once v0.8 backend ships.

---

## 1. Purpose

The **frontend slice** is in place:

- Route `/feed`, nav label **Actualités** (between Accueil and Infos), gated by `facebook_feed` feature flag.
- Shared DTO, mock fixture, vertical feed UI with “+5” pagination.
- Route middleware blocks `/feed` and `/competitions` when their flags are off.

**This document** captures open decisions and a suggested task order for wiring **Meta Graph API** on the server.

---

## 2. Club Facebook presence (Page vs Group)

The site today links to the club **Page** via `runtimeConfig.public.socialFacebook`:

- **Page:** [facebook.com/archersdelachapelle](https://www.facebook.com/archersdelachapelle/) — used in `SocialSection`, Contact, Actualités degraded links, and mock `permalinkUrl` bases.

The club’s active **Group** (member community) is separate:

- **Group:** [facebook.com/groups/104895599560784](https://www.facebook.com/groups/104895599560784)

**Why this matters for the backend PR**

| Source | Graph API | Public read-only feed on the website |
| ------ | --------- | ----------------------------------- |
| **Page** | `/{page-id}/posts` or `/feed` with a **Page access token** | Matches [project-spec.md](../../project-spec.md) §2 (“Facebook feed”); posts can be public; `permalink_url` works for outbound links. |
| **Group** | `/{group-id}/feed` | Stricter permissions; many groups are not publicly readable; tokens and app review differ from Page feeds. |

**Decision needed before implementation:** confirm with the club whether **Actualités** should show **Page** posts (public showcase, spec-aligned) or **Group** posts (where members actually post). They may differ in practice. If the feed must come from the Group, revisit spec/roadmap and Meta app permissions early — do not assume the Page endpoint will surface Group content.

Until decided, keep mock permalinks and degraded links on the **Page** URL; only change after product confirmation.

---

## 3. Spec cross-links

| Topic | Location |
| ----- | -------- |
| Social feed rules | [project-spec.md](../../project-spec.md) §2 (**Social feed**) |
| Permission to view Actualités | [project-spec.md](../../project-spec.md) §3.2 |
| Phase scope | [project-spec.md](../../project-spec.md) §10.1 row **v0.8** |
| Roadmap checkboxes | [project-roadmap.md](../../project-roadmap.md) § v0.8 |

---

## 4. Frontend contract already in place

| Piece | Path |
| ----- | ---- |
| Post DTO | [`shared/website/facebook-feed-post.dto.ts`](../../shared/website/facebook-feed-post.dto.ts) |
| Mock data (replace later) | [`shared/website/facebook-feed.mock.ts`](../../shared/website/facebook-feed.mock.ts) |
| Composable swap point | [`app/composables/useFacebookFeed.ts`](../../app/composables/useFacebookFeed.ts) — today calls mock; later `$fetch` public API |
| List pagination (client UI) | [`shared/website/feed-pagination.ts`](../../shared/website/feed-pagination.ts), [`app/components/feed/FeedPostList.vue`](../../app/components/feed/FeedPostList.vue) — page size **5** |
| Degraded UI on page | [`app/pages/feed/index.vue`](../../app/pages/feed/index.vue) — error copy + link to `socialFacebook` |

### DTO field mapping (Graph API → shared)

| DTO field | Graph API source |
| --------- | ---------------- |
| `id` | `id` |
| `message` | `message` (nullable) |
| `createdTime` | `created_time` (ISO 8601) |
| `permalinkUrl` | `permalink_url` |
| `thumbnailUrl` | `full_picture` or attachment preview |

---

## 5. Open decisions (grill)

### 5.1 Page vs Group (see §2)

Resolve Page vs Group **before** choosing endpoints and env var names (`FACEBOOK_PAGE_ID` vs `FACEBOOK_GROUP_ID`).

### 5.2 Access token

- **Page access token** required for Page posts — user tokens expire quickly and are unsuitable for a public showcase.
- Decide: long-lived Page token vs System User + scheduled refresh.
- Store in **server env only** — never `runtimeConfig.public`, never client bundles.

### 5.3 Graph endpoint and fields

- Start with `GET /{page-id}/posts` or `/{page-id}/feed` (confirm which returns public Page posts for your app permissions).
- Initial `fields`: `id,message,created_time,permalink_url,full_picture`.
- Add `attachments{media,type,url}` only if you need video/link previews beyond `full_picture`.

### 5.4 Pagination: Graph cursors vs UI “+5”

- Graph uses **cursor pagination** (`paging.cursors.after`), not offset/limit.
- UI “Voir plus d’actualités” (+5) should map to **server-side cursor state**, not client slicing of a full dump.
- Options:
  - **A.** Public API accepts `cursor` query param; returns `{ posts, nextCursor }`.
  - **B.** Server caches first N pages; client requests page index (less ideal if cache invalidates).

### 5.5 Caching

- Spec requires **server fetch + cache** ([project-spec.md](../../project-spec.md) §2).
- TTL: **15–60 minutes** is typical for read-only club news.
- Layer options: in-memory (single instance), Nitro storage, Redis (multi-instance).
- Cache key: e.g. `facebook-feed:page:{pageId}:cursor:{after|first}`.

### 5.6 Environment variables

Add to [`.env.example`](../../.env.example) (names TBD):

- `FACEBOOK_PAGE_ID`
- `FACEBOOK_PAGE_ACCESS_TOKEN` (or split app id/secret if using token exchange)

Document in README/setup only if needed; secrets stay out of git.

### 5.7 Proposed DDD slice

```
application/ports/facebook-feed-source.port.ts   → FacebookFeedSource
application/website/list-facebook-feed-posts.use-case.ts
infrastructure/facebook/facebook-graph-feed.source.ts
server/api/website-config/facebook-feed.get.ts     → public GET
server/mappers/facebook-feed.mapper.ts             → Graph JSON → FacebookFeedPostDto
```

- Handler stays thin per [nuxt-server-layers.mdc](../../.cursor/rules/nuxt-server-layers.mdc).
- Wire repository/provider only if persistence is needed (likely **not** for read-only cache).

### 5.8 Error / degraded mode

- API failure → return empty list or 503 with safe message; **page shell stays up**.
- UI already links to club Facebook page on error ([`feed/index.vue`](../../app/pages/feed/index.vue)).
- Do **not** block the rest of the site.

### 5.9 Tests

- Mapper unit tests with fixture Graph JSON (no live Meta in CI).
- Handler test with mocked `FacebookFeedSource`.
- Optional: cache behaviour test (TTL, stale fallback).

### 5.10 Mock fixture fate

- Remove from production path once API works, **or** keep for local dev behind `import.meta.dev` only.

---

## 6. Suggested next-PR task order

1. Meta app + Page token spike (manual, document env vars).
2. `FacebookFeedSource` adapter + mapper + unit tests.
3. `ListFacebookFeedPosts` use case.
4. Public `GET /api/…/facebook-feed` with cache + cursor param.
5. Wire [`useFacebookFeed`](../../app/composables/useFacebookFeed.ts) to API; remove or dev-gate mock.
6. Tick remaining [project-roadmap.md](../../project-roadmap.md) v0.8 boxes (server fetch, cache, API tests, empty/error if not already covered).

---

## 7. Roadmap items still open after UI shell

- [ ] Server-side Facebook fetch with caching and env credentials
- [ ] Tests for fetch mapper and public API handler
- [ ] Confirm empty/degraded behaviour against spec once API is wired (UI partial today)
