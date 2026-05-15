# Hacker News Frontend

A React frontend for Hacker News built with Vite, React Query, and a feature-based architecture.

```bash
npm install
npm run dev       # Start dev server
npm run lint      # Run linter
```

## Project Structure

Use bulletproof react organization:

```text
src/
├── components/    Shared UI and layouts
├── features/      Feature modules (nav, stories, users)
├── lib/           Shared utilities
├── pages/         Page-level components
└── main.jsx       Entry point
```

## Documentation

- **[Architecture](./docs/architecture/overview.md)** - Feature-based structure and core design decisions.
- **[Data Flow](./docs/architecture/data-fetching.md)** - How React Query handles caching and API calls.
- **[Shared Infrastructure](./docs/architecture/infrastructure.md)** - API client, layouts, and utilities.

### Features
- **[Stories](./docs/features/stories.md)** - Story list and item detail display.
- **[Navigation](./docs/features/nav.md)** - URL-driven category switching.

### Adding a New Feature

See [Architecture Overview](./docs/architecture/overview.md) → Design Rules section.
