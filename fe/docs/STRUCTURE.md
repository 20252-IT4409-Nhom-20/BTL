# Documentation Map

Visual guide to what's in the docs folder and how pieces connect.

```
README.md (entry point)
├── Quick Start
├── Project Structure
└── Links to docs

docs/
├── STRUCTURE.md (this file)
├── architecture/
│   ├── overview.md
│   │   └─ Feature-based design, data flow (Nav → URL → Stories → React Query), design rules
│   ├── data-fetching.md
│   │   └─ React Query caching, with concrete example (News → Ask → News)
│   └── infrastructure.md
│       └─ Shared utilities: MainLayout, API client, time formatter
└── features/
    ├── nav.md
    │   └─ Navigation bar, URL-driven state, triggers Stories feature
    └── stories.md
        └─ Story list and item detail, integrates with Navigation and Data Fetching
```

## How They Connect

- **Architecture Overview** explains the design and shows how [Stories](features/stories.md) and [Navigation](features/nav.md) fit together
- **Data Fetching** explains React Query caching, referenced by both feature docs
- **Stories** references [Navigation](features/nav.md) (shows dependency) and [Data Fetching](architecture/data-fetching.md) (explains caching benefit)
- **Navigation** references [Stories](features/stories.md) (shows integration) and [Data Fetching](architecture/data-fetching.md) (explains caching benefit)

## Reading Paths

**New to the project:**
- README.md (30 sec) → Architecture Overview (2 min) → [Stories](features/stories.md) + [Navigation](features/nav.md) (2 min)

**Understand how data flows:**
- [Data Fetching](architecture/data-fetching.md) (2 min) → [Stories "How It Works"](features/stories.md) (1 min)

**Understand how Nav triggers Stories:**
- [Navigation](features/nav.md) (1 min) → [Stories](features/stories.md) (1 min) → [Data Fetching](architecture/data-fetching.md) (1 min)

**Add a new feature:**
- [Architecture Overview](architecture/overview.md) → Design Rules section (explains isolation, shared code, etc.)
- Look at `features/stories/` as a template: `api/`, `components/`, `types/` directories
