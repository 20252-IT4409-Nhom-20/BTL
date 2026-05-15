# Architecture

This app uses a **feature-based structure** where features are independent modules containing their own API logic, components, and types.

## Core Design

**Features** are self-contained domains. Navigation drives the app-each URL corresponds to a story type. When the URL changes, the Stories feature fetches and displays the appropriate list.

```
URL Change (Nav Feature)
    ↓
StoriesPage reads URL params
    ↓
useStories hook fetches list (React Query handles caching)
    ↓
Story components render each item (fetch details via useItem)
```

See the feature docs for specifics on how [Stories](../features/stories.md) and [Navigation](../features/nav.md) work together.

## Directory Layout

| Directory | Purpose |
|-----------|---------|
| `features/` | Modules for Stories, Navigation, Users. Each has `api/`, `components/`, `types/`. |
| `components/` | Shared UI: MainLayout (navbar + page outlet). |
| `lib/` | Utilities: API client, time formatting. |
| `pages/` | Route handlers: StoriesPage maps URL to story type and renders. |

## Key Dependencies

- **React** - UI framework.
- **Vite** - Build tool and dev server.
- **React Router** - URL-driven state and navigation.
- **React Query** - Data fetching, caching, and synchronization.
- **Axios** - HTTP client for API calls.

## Design Rules

1. **Features are isolated.** A feature shouldn't import from another feature unless documented.
2. **Shared code goes to `lib/` or `components/`.** If it's used by multiple features, it's shared infrastructure.
3. **API logic stays in the feature.** Each feature's `api/` directory contains all its data fetching logic.
4. **Types are local.** Feature-specific types live in the feature's `types/` directory.
