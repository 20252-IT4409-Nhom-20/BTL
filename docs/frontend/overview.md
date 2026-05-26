# Frontend Architectural Overview

The frontend is a single-page application built with **React**, **Vite**, and styled using semantic, lightweight CSS hierarchies. It has been structured for optimal decoupling and ease of expansion.

## Directory Structure

```text
fe/src/
  ├── assets/          # Static media assets, SVGs
  ├── components/      # Shared layout, navigation, and generic UI components
  ├── features/        # Feature modules containing isolated business logic
  │   ├── hn/          # Main HackerNews features (Story Lists, Comment Trees)
  │   └── user/        # Authentication, login pages, and profiles
  ├── lib/             # API connection instances and configuration (e.g., Axios setup)
  ├── pages/           # High-level page routing assemblies
  └── types/           # Global type contracts
```

---

## Technical Patterns

### 1. Data Fetching & Caching
The application queries list feeds of ID arrays (e.g., `/topstories`, `/newstories`) and subsequently retrieves individual items (`/item/:id`) asynchronously.
- Direct request batches are executed with `Promise.all` to keep load sequences efficient.
- Custom async lifecycle hooks (located inside features) clean up states on component unmounts to prevent memory leaks.

### 2. Recursive Comment Trees
A core technical highlight is rendering nested comment threads to arbitrary depths. This is achieved through component-driven recursion:
- `CommentTree.jsx` iterates over a parent item's `kids` array.
- It maps each child ID to a `Comment.jsx` instance.
- Inside `Comment.jsx`, if the item itself contains children (`kids`), it triggers a new instance of `CommentTree.jsx` nested within itself.
- Proper indentations are managed cleanly with CSS margins.

```
   fe/index.html
     ↓
   fe/src/main.jsx
     ↓
   fe/src/App.jsx
     ↓
   <BrowserRouter>
     <Route path="/:type" element={<StoriesPage />} />
     ↓
   fe/src/pages/StoriesPage.tsx
     ├─ imports: useStoriesItems from '@/features/stories/api/getItems'
     ├─ const storyType = pathToType[type] // 'news' → 'top'
     ├─ const { data: items } = useStoriesItems(storyType, page, limit)
     └─ {items?.map((item) => <Story key={item.id} item={item} />)}
          ↓
   fe/src/features/stories/api/getItems.ts
     ├─ export const useStoriesItems = (type, page, limit) => {
     │   return useQuery(getStoriesItemsQueryOptions(type, page, limit))
     │  }
     ├─ export const getStoriesItemsQueryOptions = (...) => {
     │   queryKey: ['stories', 'items', type, page, limit]
     │   queryFn: () => fetchStoriesItems(type, page, limit)
     │  }
     └─ export const fetchStoriesItems = (type, page, limit) => {
          return api.get(`${storyEndpoints[type]}?page=${page}&limit=${limit}`)
          // storyEndpoints['top'] = '/topstories'
          // → api.get('/topstories?page=1&limit=30')
          }
          ↓
   fe/src/lib/api-client.ts
     ├─ const API_BASE_URL = 'http://domain.com'
     ├─ axios instance with interceptors
     └─ Sends: GET http://domain.com/api/topstories?page=1&limit=30
          ↓
          [NETWORK REQUEST]
          ↓
         [be]
```

