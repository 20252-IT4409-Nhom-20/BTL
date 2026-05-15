# Batch Fetching & Delta Updates

## Pattern

Fetch multiple items in a single request instead of N+1 (one for list, one per item).

### Batch Initial Load

```
GET /stories/{type}.json
← {items: [hnItem, hnItem, ...], timestamp}
```

Instead of:
```
GET /topstories.json → [id, id, ...]
GET /item/{id1}.json
GET /item/{id2}.json
... (31 requests total)
```

### Live Updates

After initial load, send only changed fields via WebSocket or polling:

```json
{
  "type": "update",
  "id": 1,
  "data": {"score": 105, "descendants": 42},
  "timestamp": 1234567900
}
```

## Shapes

**Story list batch:**
```json
{
  "items": [{id, type, title, score, ...}, ...],
  "timestamp": 1234567890
}
```

**Thread batch (story + comments):**
```json
{
  "parent": {id, type, title, score, ...},
  "children": [{id, type, text, score, ...}, ...]
}
```

## Implementation

**`src/features/stories/api/getStoriesBatch.ts`**
```typescript
export const getStoriesBatch = (type: string): Promise<{items: hnItem[], timestamp: number}> =>
  api.get(`/stories/${type}`);

export const getStoriesBatchQueryOptions = (type: string) =>
  queryOptions({
    queryKey: ['stories-batch', type],
    queryFn: () => getStoriesBatch(type),
  });

export const useStoriesBatch = (type: string) =>
  useQuery(getStoriesBatchQueryOptions(type));
```

**`src/features/comments/api/getThreadBatch.ts`**
```typescript
export const getThreadBatch = (storyId: number): Promise<{parent: hnItem, children: hnItem[]}> =>
  api.get(`/stories/${storyId}/thread`);

export const getThreadBatchQueryOptions = (storyId: number) =>
  queryOptions({
    queryKey: ['thread', storyId],
    queryFn: () => getThreadBatch(storyId),
  });

export const useThreadBatch = (storyId: number) =>
  useQuery(getThreadBatchQueryOptions(storyId));
```

**Component usage:**
```typescript
// Story list
const { data } = useStoriesBatch('top');
return data.items.map((story, i) => <Story id={story.id} rank={i+1} />);

// Comment page
const { data } = useThreadBatch(storyId);
return <>
  <Story id={data.parent.id} rank={0} />
  {data.children.map(c => <Comment item={c} />)}
</>;
```

## Cache Invalidation

- `['stories-batch', type]` → invalidate on refresh
- `['thread', id]` → invalidate on refresh
- WebSocket delta updates → patch cached data (no refetch)
