# Batch Fetching & Delta Updates

## Problem

The current main page sends **31 requests at once**:
1. `/topstories.json` → Returns 30 IDs
2. `/item/{id}.json` × 30 → Returns individual stories

This creates N+1 problem and overwhelming network load.

## Solution: Batch Fetching + Delta Updates

### Phase 1: Batch Initial Load

Instead of fetching IDs then individual items, fetch all items in one request:

```
GET /stories/{type}.json
← Returns array of 30 hnItem objects directly
```

**Response shape:**
```json
{
  "items": [
    { "id": 1, "type": "story", "title": "...", "score": 100, ... },
    { "id": 2, "type": "story", "title": "...", "score": 98, ... },
    // ... 28 more items
  ],
  "timestamp": 1234567890
}
```

### Phase 2: Live Updates (Delta Only)

Instead of refetching the full 30 items, use WebSocket or polling to send only changed fields:

```
{
  "type": "update",
  "id": 1,
  "data": {
    "score": 105,
    "descendants": 42
  },
  "timestamp": 1234567900
}
```

### Rendering

No changes needed to `Story` component. The cached data structure remains the same:
- Still receives `id` and `rank`
- Still calls a hook to get story data
- Hook now resolves from cache (populated by batch fetch)

## Reusable Pattern: Parent + Children

Both story list and comment page follow the same pattern:

### Story List (Main Page)
```
Parent: List of stories (30 items)
Children: N/A
Pattern: One batch request → renders 30 items
```

### Comment Page
```
Parent: One story (1 item)
Children: Comments (x items)
Pattern: One batch request → renders 1 + x items
```

**Generic pattern:**
```
GET /{parent}/{id}/thread.json
← Returns {
    "parent": hnItem,
    "children": [hnItem, hnItem, ...]
  }
```

## Implementation

### API Layer

**`src/features/stories/api/getStoriesBatch.ts`**
```typescript
// Replaces getStories + getItem two-request pattern
export const getStoriesBatch = (type: string): Promise<hnItem[]>
  → Calls GET /stories/{type}.json
  → Returns array of hnItem objects
  → Query key: ['stories-batch', type]
```

**`src/features/comments/api/getThreadBatch.ts`**
```typescript
// Reuses same pattern for comment page
export const getThreadBatch = (storyId: number): Promise<{ parent: hnItem, children: hnItem[] }>
  → Calls GET /stories/{storyId}/thread.json
  → Returns parent + children
  → Query key: ['thread', storyId]
```

### Component Layer

**No changes to Story component** — still receives `id` and `rank`, still calls a hook.

**StoriesPage**
```diff
- const { data: ids } = useStories(type)
- {ids.map((id, i) => <Story id={id} rank={i+1} />)}
+ const { data: stories } = useStoriesBatch(type)
+ {stories.map((story, i) => <Story id={story.id} rank={i+1} />)}
```

**CommentPage** (new)
```typescript
const { data } = useThreadBatch(storyId)
return <>
  <Story id={data.parent.id} rank={0} />
  {data.children.map(comment => <Comment item={comment} />)}
</>
```

## Cache Invalidation

Both patterns use React Query's same caching mechanism:
- `['stories-batch', type]` invalidates on refresh
- `['thread', id]` invalidates on refresh
- WebSocket delta updates patch the cached data without refetching

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| Initial requests | 31 | 1 |
| Initial payload | 31 HTTP headers + 30 item responses | 1 HTTP header + 1 batch response |
| Live update payload | N/A | Only changed fields (id + delta) |
| Time to First Paint | Slower (waiting for 30 requests) | Faster (1 request) |
| Code reusability | Separate patterns for stories/comments | Unified pattern |
