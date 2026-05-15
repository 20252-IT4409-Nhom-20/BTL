# API Architecture: 3-Layer Pattern with Stable Base Contract

## Architecture

The frontend uses a **3-layer API architecture**:

```
┌─────────────────────────────────────────────┐
│ React Components (Story, StoriesPage, etc) │
└────────────────┬────────────────────────────┘
                 │ useHook()
┌─────────────────▼────────────────────────────┐
│ Feature APIs (getStories, getItem, etc)     │
│ src/features/*/api/*.ts                     │
└────────────────┬────────────────────────────┘
                 │ api.get(...)
┌─────────────────▼────────────────────────────┐
│ Base API Client (lib/api-client.ts)         │
│ - Auth token injection (request interceptor)│
│ - Error handling (response interceptor)     │
│ - Global headers                            │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │ Backend        │
         └────────────────┘
```

---

## Layer 1: Base API Client

**File:** `src/lib/api-client.ts`

Initialized once at app startup. Never called directly from components.

**Token lifecycle:**
```typescript
// Set token after login
localStorage.setItem('auth_token', responseToken);

// Removed automatically on 401 (response interceptor)
// Or manually:
localStorage.removeItem('auth_token');
```

**Error handling:**
- `401` → Removes token, redirects to `/login`
- `403` → Rejects promise (component shows error)
- `500` → Rejects promise (component shows error)
- Other errors → Rejects promise

**Implementation caveats:**
- Token is read from localStorage at request time (not at function definition time)
- Response body is automatically unwrapped (no `.data.data` access)
- 401 handler must clear token AND redirect immediately to prevent stale auth state

---

## Layer 2: Feature APIs

**Files:** `src/features/{feature}/api/*.ts`

Thin wrappers combining base client with React Query. Three exports per feature:

```typescript
// src/features/stories/api/getStoriesBatch.ts

import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { hnItem } from '@/features/stories/types/hnItem';

// 1. Data-fetching function
export const getStoriesBatch = (type: string): Promise<{ items: hnItem[] }> =>
  api.get(`/stories/${type}`);

// 2. React Query config
export const getStoriesBatchQueryOptions = (type: string) =>
  queryOptions({
    queryKey: ['stories-batch', type],
    queryFn: () => getStoriesBatch(type),
    staleTime: 5 * 60 * 1000,
  });

// 3. Hook for components
export const useStoriesBatch = (type: string) =>
  useQuery(getStoriesBatchQueryOptions(type));
```

**Implementation caveats:**
- Do NOT import axios or http libs directly
- Do NOT add auth headers
- Do NOT add base URL
- Do NOT duplicate error handling
- Keep this file under 30 lines

---

## Layer 3: Components

**Files:** `src/pages/*.tsx`, `src/components/*.tsx`

Rendering only.

```typescript
import { useStoriesBatch } from '@/features/stories/api/getStoriesBatch';

export default function StoriesPage() {
  const { data, isLoading, error } = useStoriesBatch('top');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <table>
      <tbody>
        {data?.items.map((item, i) => (
          <Story key={item.id} id={item.id} rank={i + 1} />
        ))}
      </tbody>
    </table>
  );
}
```

**Implementation caveats:**
- Mock the feature API hook in tests, not the base client
- Render error state, don't throw



---

## Environment Setup

```bash
# Development
VITE_API_BASE_URL=http://localhost:3000/api npm run dev

# Staging
VITE_API_BASE_URL=https://staging.api.example.com/api npm run build

# Production
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

**File:** `.env.local` (never commit)

Switch backends at runtime:
```bash
VITE_API_BASE_URL=https://staging.api.com npm run dev
```

---



## Testing Locally

**Verify token injection:** Open DevTools → Network tab. Requests should include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

**Test error handling:**
```typescript
// Browser console
localStorage.removeItem('auth_token');
// Then make any API call — should redirect to /login
```

---

## Adding New Features

```typescript
// src/features/comments/api/getComments.ts
import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export const getComments = (storyId: number) =>
  api.get(`/stories/${storyId}/comments`);

export const getCommentsQueryOptions = (storyId: number) =>
  queryOptions({
    queryKey: ['comments', storyId],
    queryFn: () => getComments(storyId),
  });

export const useComments = (storyId: number) =>
  useQuery(getCommentsQueryOptions(storyId));
```

---

## Responsibility Summary

| Concern | Where | How |
|---|---|---|
| **Auth token** | `api-client.ts` | Request interceptor |
| **Error handling** | `api-client.ts` | Response interceptor |
| **Base URL** | `api-client.ts` config | Environment variable |
| **Response unwrapping** | `api-client.ts` | Response interceptor |
| **Feature routes** | `features/*/api/*.ts` | `api.get(...)` |
| **React Query config** | `features/*/api/*.ts` | `queryOptions(...)` |
| **Rendering** | Components | `useHook()` and JSX |

---

## Setup Checklist

- [ ] `src/lib/api-client.ts` — baseURL set, auth interceptor implemented, 401 handler redirects
- [ ] Feature API files created with three exports: function, queryOptions, hook
- [ ] Components use feature hooks, not direct api.get() calls
- [ ] localStorage token key consistent everywhere
- [ ] Error interceptor clears token AND redirects (not just one)
