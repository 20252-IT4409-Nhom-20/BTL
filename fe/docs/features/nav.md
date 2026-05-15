# Navigation Feature

Provides the top navigation bar and drives URL-based category selection.

## How It Works

The **Navbar** component displays links for each story category (News, Ask, Show, Jobs). Clicking a link updates the URL via `NavLink` from React Router.

**Data flow:**

```
User clicks "Ask"
    ↓
URL changes to /ask
    ↓
StoriesPage sees new URL param
    ↓
useStories('ask') fetches that category's stories
    ↓
Stories render with cached data (if category was visited before)
```

Because navigation updates the URL, the Stories feature automatically responds-no props drilling, no event callbacks.

## Components

**Navbar**
- Renders the site logo (linked to home) and navigation links.
- Uses `NavLink` from React Router-it automatically highlights the current active link.
- Implements the classic HN table-based layout with navbar on the left and login on the right.
- See [Shared Infrastructure](../architecture/infrastructure.md) for where Navbar lives.

## Interaction with Stories

When the URL changes, **StoriesPage** re-renders and calls `useStories` with the new type. React Query's cache means:

- **First visit** to a category: stories are fetched and rendered.
- **Return to a category**: cached stories render instantly while fresh data loads in the background.

For how Stories responds to navigation and uses the data fetching layer, see [Stories Feature](./stories.md).
