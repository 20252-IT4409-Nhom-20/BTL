# Stories Feature

Fetches and displays Hacker News stories in a list view.

## How It Works

The **StoriesPage** (in `pages/`) reads the URL and calls `useStories(type)`. This hook:

1. Calls `getStories(type)` to fetch story IDs.
2. Caches the result with key `['stories', type]` via React Query.
3. Returns the ID array and loading/error states.

For each ID, a `<Story />` component is rendered. It calls `useItem(id)` to fetch and display:
- Rank, title, and link
- Score, author, time, and comments count

Caching ensures that switching back to a previously viewed category renders instantly (see [Data Fetching](../architecture/data-fetching.md)).

## API Logic

**getStories.ts**
- `useStories(type)` - Returns story IDs for a given type (e.g., 'top', 'new', 'ask').
- Query key: `['stories', type]`

**getItem.ts**
- `useItem(id)` - Returns details for a single item (title, score, author, etc.).
- Query key: `['item', id]`
- Shared cache: if the same item appears in multiple places, it's fetched once.

## Components

**Story**
- Accepts `id` (item ID) and `rank` (position in list).
- Renders two `<tr>` elements to match the HN classic layout.
- Handles loading and error states.

**StoriesPage**
- Maps URL params to story type (e.g., `/:type` → `'top'`, `'ask'`, etc.).
- Fetches list via `useStories(type)`.
- Renders all stories in a `<table>`.

See [Navigation](./nav.md) for how URL changes trigger story fetches.
