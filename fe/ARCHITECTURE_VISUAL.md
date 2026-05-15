# Architecture: Before vs. After

## Current Architecture (31 Requests)

```
┌─────────────────────────┐
│   StoriesPage           │
│   useStories(type)      │
└────────┬────────────────┘
         │
         ├─→ Request: GET /topstories.json
         │   Response: [1, 2, 3, ..., 30]
         │
         ├─→ Map over IDs, render Story(id)
         │   │
         │   ├─→ Story(1)
         │   │   useItem(1)
         │   │   Request: GET /item/1.json
         │   │   Response: {id:1, title:"...", score:100, ...}
         │   │
         │   ├─→ Story(2)
         │   │   useItem(2)
         │   │   Request: GET /item/2.json
         │   │   Response: {id:2, title:"...", score:98, ...}
         │   │
         │   └─→ Story(30)
         │       useItem(30)
         │       Request: GET /item/30.json
         │       Response: {id:30, title:"...", score:..., ...}
         │
         └─→ Total: 1 + 30 = 31 requests
```

---

## New Architecture (1 Request)

```
┌──────────────────────────────┐
│    StoriesPage               │
│    useStoriesBatch(type)     │
└────────┬─────────────────────┘
         │
         ├─→ Request: GET /stories/top.json
         │   Response: {
         │     items: [
         │       {id:1, title:"...", score:100, ...},
         │       {id:2, title:"...", score:98, ...},
         │       ...
         │       {id:30, title:"...", score:..., ...}
         │     ]
         │   }
         │
         ├─→ Map over items, render Story(id)
         │   │
         │   ├─→ Story(1) [data from cache]
         │   ├─→ Story(2) [data from cache]
         │   └─→ Story(30) [data from cache]
         │
         └─→ Total: 1 request
```

---

## Reusable Pattern: Parent + Children

### Story List
```
Request: GET /stories/{type}.json

Response:
{
  items: [
    { id:1, type:'story', ... },
    { id:2, type:'story', ... },
    ...
    { id:30, type:'story', ... }
  ]
}

Rendering:
┌──────────────────┐
│ Batch 1: 30 items│ ← All rendered by Story component
└──────────────────┘
```

### Comment Page (Future)
```
Request: GET /stories/{id}/thread.json

Response:
{
  parent: { id:123, type:'story', title:"...", ... },
  children: [
    { id:456, type:'comment', text:"...", ... },
    { id:789, type:'comment', text:"...", ... },
    ...
  ]
}

Rendering:
┌──────────────────┐
│ Parent: 1 story  │ ← Rendered by Story component
├──────────────────┤
│ Children: N cmts │ ← Rendered by Comment component
└──────────────────┘
```

---

## Live Updates (Optional)

Without live updates:
```
User scrolls / waits → React Query marks data stale → Refetch /stories/{type}.json → 30 items in 1 request
```

With live updates (WebSocket):
```
Server broadcasts:
  { type:'update', id:1, data:{ score:105, descendants:42 }, timestamp }

Client receives → React Query's setQueryData() patches cache → UI re-renders with fresh data
```

No refetch needed. Only changed fields are sent over the wire.

---

## Code Impact

### Before
```typescript
// pages/StoriesPage.tsx
const { data: ids } = useStories(type);
return <table>
  {ids?.map((id, i) => <Story key={id} id={id} rank={i+1} />)}
</table>

// Each Story component triggers its own useItem(id) query
// → 31 total requests
```

### After
```typescript
// pages/StoriesPage.tsx
const { data } = useStoriesBatch(type);
return <table>
  {data?.items.map((item, i) => <Story key={item.id} id={item.id} rank={i+1} />)}
</table>

// All items already cached by useStoriesBatch
// Story component still works the same way (receives id, calls hook)
// → 1 total request
```

Notice: **Story component doesn't change**. Data injection pattern changes, not the component interface.

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Requests** | 31 (1 list + 30 items) | 1 |
| **Network overhead** | 30 HTTP headers | 1 HTTP header |
| **Time to first paint** | Slower (waiting for slowest item fetch) | Faster (single batch) |
| **Live updates** | N/A | Only deltas sent |
| **Reusability** | Separate for stories/comments | Unified pattern |
| **Component changes** | None | None |

