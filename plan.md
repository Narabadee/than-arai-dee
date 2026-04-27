# Bug Fix Plan

## Bugs to Fix

### Bug 1 — Random Page is Blank
**Root cause:** `useAllDishes()` fetches dishes asynchronously. When the Random page first renders, `dishes = []` and `reels = [0, 1, 2]`. The slot machine reels try to render `dishes[0]`, `dishes[1]`, `dishes[2]` — all `undefined` — which crashes with `Cannot read properties of undefined (reading 'image')`, producing a blank page.

**Fix:** In `src/pages/Random.tsx`, add a loading guard that shows a spinner when `dishes` is still loading. Wrap the slot machine cabinet render with `if (loading) return <LoadingState />`.

**File:** `src/pages/Random.tsx`

---

### Bug 2 — Community: No Username on Post
**Root cause:** The posts table column is `user_id` but the frontend `Post` type and `Social.tsx` read `p.user`. The SQL query `SELECT * FROM posts` returns `user_id`, so `p.user` is always `undefined`.

**Fix:** In `server/routes/posts.ts`, change the SQL to alias the columns:
```sql
SELECT id, user_id AS user, avatar, dish, caption, likes, comments_count AS comments, rating, color, image, deleted FROM posts
```

**File:** `server/routes/posts.ts`

---

### Bug 3 — Community: Can't Click Poster Profile
**Root cause:** Same as Bug 2. `openCookProfile(p.user)` receives `undefined` (since `p.user` is undefined), so it navigates to `/profile/undefined`, which finds no cook and fails silently.

**Fix:** Resolved by the same SQL alias fix in Bug 2 (`user_id AS user`). Once `p.user` returns the correct cook ID (e.g., `"nim_eats"`), the navigate call `/profile/nim_eats` will work. No additional code change needed beyond Bug 2's fix.

**File:** `server/routes/posts.ts` (same fix as Bug 2)

---

## Implementation Steps

| # | File | Change | Risk |
|---|------|---------|------|
| 1 | `src/pages/Random.tsx` | Use `loading` from `useAllDishes()`, show loading state while dishes fetch | Low |
| 2 | `server/routes/posts.ts` | Alias `user_id AS user` and `comments_count AS comments` in all SELECT queries | Low |

## Estimated Complexity: LOW
- Both fixes are small, targeted, and non-breaking.
- No schema changes needed.
- No new dependencies.
