# Coding Guidelines

Stories, comments, jobs, Ask HNs and even polls are just items.

---

## 1. Cấu Trúc Thư Mục

```
   src
  +-- app               # application layer containing:
  |   |                 # this folder might differ based on the meta framework used
  |   +-- routes        # application routes / can also be pages
  |   +-- app.tsx       # main application component
  |   +-- provider.tsx  # application provider that wraps the entire application with different global providers - this might also differ based on meta framework used
  |   +-- router.tsx    # application router configuration
  +-- components       # Shared UI (Button, Spinner, Layout)
  +-- config           # Environment/API config
  +-- features
    +-- hn
    |   +-- api          # Data fetching w/ axios
    |   |   +-- getItem.ts    # Fetch any item (story/comment/etc) by ID
    |   |   +-- getList.ts    # Fetch array of IDs (top/new/best)
    |   +-- components   # Feature-specific UI
    |   |   +-- StoryCard.tsx    # (Main feed) Displays: title, score, by, time, url, descendants
    |   |   +-- StoryDetail.tsx  # (Detailed view) Displays: title, score, by, time, url, text, descendants
    |   |   +-- Comment.tsx      # Displays: text, by, time, kids (recursive trigger)
    |   |   +-- CommentTree.tsx  # Maps over kids, renders list of Comment.tsx
    |   +-- types        # Interfaces for HN items
    +-- user            # Username, login, user posts, etc
  +-- lib              # Preconfigured Axios instance
  +-- types            # Global types
├── App.jsx
└── main.jsx
```

**Quy tắc:**
- **1 feature = 1 folder** trong `src/features/`
- **Đặt code sát nơi sử dụng** → Components riêng → API riêng → Hooks riêng
- **Không import across features** → Ví dụ: `features/stories` không import từ `features/comments`
- **Import trực tiếp** → Không dùng barrel exports (index.js chỉ dùng cho public API)

---

## 2. Components

### 2.1 Tách Component Nhỏ
❌ Không làm như này:
```jsx
function StoryList() {
  function renderItem() {
    return <tr>...</tr>  // Lồng hàm render
  }
  return <table>{renderItem()}</table>
}
```

✅ Làm như này:
```jsx
function StoryItem({ story }) {
  return <tr>...</tr>
}

function StoryList() {
  return <table><StoryItem {...story} /></table>
}
```

### 2.2 Props - Giới Hạn < 5 Props
Nếu quá 5 props → Tách component hoặc dùng composition

### 2.3 Naming
- Components: `PascalCase` → `StoryItem.jsx`
- Files: `kebab-case` → `story-item.jsx`
- Folders: `kebab-case` → `src/features/story-list/`

---

## 3. API Layer

### 3.1 Cấu Trúc API
```jsx
// src/features/stories/api.js

// 1. Type
export const StorySchema = {
  id: 'number',
  title: 'string',
  score: 'number',
  by: 'string',
  // ...
}

// 2. Fetcher
async function getTopStories(page = 0) {
  const ids = await fetch('/v0/topstories.json').then(r => r.json())
  const sliced = ids.slice(page * 10, (page + 1) * 10)
  return Promise.all(sliced.map(id => 
    fetch(`/v0/item/${id}.json`).then(r => r.json())
  ))
}

// 3. Hook
export function useStories(page) {
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    getTopStories(page)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [page])
  
  return { data, error, loading }
}
```

**Quy tắc:**
- API client (http.js) → Cấu hình một lần
- Mỗi endpoint → Một file hoặc một function
- Export hooks → Dùng trong components

---

## 4. State Management

### 4.1 Ưu Tiên
1. **Component state** (`useState`) → Default
2. **URL state** (`?page=1`) → Pagination, filters
3. **Shared state** (Context/Zustand) → Global modals, theme → Hiếm dùng
4. **Server cache** (React Query/SWR) → Từ API

### 4.2 Ví Dụ
```jsx
// ❌ Không dùng global state cho component state
const [stories, setStories] = useGlobalStore() // Sai!

// ✅ Dùng component state
function StoryList() {
  const [page, setPage] = useState(0)
  const { data: stories } = useStories(page)
  return <>{...}</>
}
```

---

## 5. Imports

### 5.1 Absolute Imports
❌ Tránh:
```jsx
import { StoryItem } from '../../../components/story-item'
```

✅ Dùng:
```jsx
import { StoryItem } from '@/features/stories/StoryItem'
```

### 5.2 Import Order
1. React
2. 3rd party libraries
3. Local imports (from `@/`)
4. CSS

```jsx
import React from 'react'
import axios from 'axios'
import { useStories } from '@/features/stories/api'
import './StoryList.css'
```

---

## 6. Naming & Conventions

| Loại | Convention | Ví Dụ |
|------|-----------|--------|
| Files (.jsx) | kebab-case | `story-item.jsx` |
| Folders | kebab-case | `src/features/story-list/` |
| Components | PascalCase | `function StoryItem()` |
| Hooks | camelCase, bắt đầu với `use` | `useStories()` |
| Constants | UPPER_SNAKE_CASE | `ITEMS_PER_PAGE = 10` |
| Variables | camelCase | `const pageNumber = 0` |

---

## 7. Git & Issues

**Trước khi code bất kỳ feature nào:**

1. **Open Issue** → Describe feature + technical plan
2. **Discuss** → Comment, approve từ team member
3. **Create branch** → `feat/feature-name`

Example issue template:
```
Title: [Feature #8] Item List - Display Stories

Description:
- Fetch stories from /v0/topstories.json
- Display in table: index, title, score, time, comments
- Pagination: 10 items/page
- Files: src/features/stories/

Assigned to: @person
```

---

## 8. Checklist Trước Khi Push

- [ ] Code chạy không lỗi
- [ ] Imports đúng (absolute paths, order)
- [ ] Naming convention đúng (kebab-case files, PascalCase components)
- [ ] Components tách nhỏ (< 200 lines, < 5 props)
- [ ] API layer có types, fetcher, hook
- [ ] Không import across features
- [ ] ESLint pass (`npm run lint`)

---

## 9. Liên Lạc

- **Không biết làm?** → Hỏi trong issue comment
- **Thay đổi cấu trúc?** → Discuss trc → Update guideline này
- **Bug?** → Tạo issue, assign người có liên quan

---

**Tl;dr: Features riêng → Components nhỏ → API tách biệt → Không xuyên feature → Bàn trước → Code sau.**
