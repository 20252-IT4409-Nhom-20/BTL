# Data Fetching & Caching

React Query manages all data fetching. It automatically caches results and handles background updates.

## How It Works

Each API call has a **query key** (e.g., `['stories', 'top']` or `['item', 123]`). React Query uses this to:

1. **Cache the result** after the first fetch.
2. **Reuse cached data instantly** if the same key is requested again.
3. **Mark data stale** immediately (`staleTime: 0`), so fresh data is refetched in the background.

## Example: Switching Story Categories

**Scenario:** User clicks News → Ask → News

1. **First visit to News:** `useStories('top')` fetches and caches with key `['stories', 'top']`.
2. **Switch to Ask:** `useStories('ask')` fetches with key `['stories', 'ask']` (different cache entry).
3. **Return to News:** React Query renders the cached `['stories', 'top']` instantly. Fresh data loads in the background.

Result: navigation feels instant even though stale data is refreshed behind the scenes.

## In This App

- **Story lists:** Key = `['stories', type]` (e.g., `['stories', 'top']`). Defined in `src/features/stories/api/getStories.ts`.
- **Individual items:** Key = `['item', id]`. Defined in `src/features/stories/api/getItem.ts`. Shared across story list and detail views.

## Configuration

Initialized in `src/main.jsx`:

```javascript
const queryClient = new QueryClient()
<QueryClientProvider client={queryClient}><App /></QueryClientProvider>
```

Defaults: `staleTime: 0ms`, `gcTime: 5min` (cache persists for 5 min after last use).
