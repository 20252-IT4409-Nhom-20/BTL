# Batch Fetching Implementation Checklist

## Prerequisite

Backend must support these new endpoints:
- `GET /stories/{type}.json` → Returns `{ items: hnItem[], timestamp }`
- `GET /stories/{id}/thread.json` → Returns `{ parent: hnItem, children: hnItem[] }`

See [Batch Fetching & Delta Updates](./docs/architecture/batch-fetching.md) for response schemas.

---

## Phase 1: Stories Batch Fetch (Main Page)

- [ ] Create `src/features/stories/api/getStoriesBatch.ts`
  - [ ] Fetch from `/stories/{type}.json`
  - [ ] Parse and return hnItem array
  - [ ] Define query key: `['stories-batch', type]`

- [ ] Update `src/pages/StoriesPage.tsx`
  - [ ] Replace `useStories(type)` with `useStoriesBatch(type)`
  - [ ] Map over `.items` instead of fetching individual IDs
  - [ ] Keep `<Story>` component interface unchanged

- [ ] Test
  - [ ] Verify one request is sent instead of 31
  - [ ] Verify stories render identically
  - [ ] Verify navigation caching still works

---

## Phase 2: Live Updates (Optional for MVP)

- [ ] Set up WebSocket connection or polling interval
  - [ ] Listen on `/updates` or similar
  - [ ] Receive delta updates: `{ id, data: { field: value }, timestamp }`

- [ ] Implement cache patching
  - [ ] Use React Query's `setQueryData()` to patch individual fields
  - [ ] Avoid full refetch, only update changed fields

---

## Phase 3: Comments Batch Fetch (Future)

- [ ] Create `src/features/comments/api/getThreadBatch.ts`
  - [ ] Fetch from `/stories/{id}/thread.json`
  - [ ] Return `{ parent: hnItem, children: hnItem[] }`
  - [ ] Query key: `['thread', id]`

- [ ] Create `src/pages/CommentPage.tsx`
  - [ ] Use `useThreadBatch(id)`
  - [ ] Render parent story (reuse `<Story>` component)
  - [ ] Render children as comments (new `<Comment>` component)

- [ ] Create `src/features/comments/components/Comment.tsx`
  - [ ] Receives `hnItem` of type `'comment'`
  - [ ] Renders text, author, score, children recursively

---

## Notes

- No changes to `Story` component — it still works with ID + rank
- Both story list and comment page use the same reusable pattern
- Cache invalidation stays the same (React Query handles it)
- `Story` component remains a "dumb" presenter; data injection happens at page level

