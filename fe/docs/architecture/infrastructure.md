# Shared Infrastructure

Utilities and layouts shared across features.

## MainLayout Component

The root wrapper. Renders the Navbar at the top and provides a page outlet for routes.

```jsx
<MainLayout>
  <Navbar />  (renders stories navigation)
  <Outlet />  (renders page content)
</MainLayout>
```

## API Client (`lib/api-client.ts`)

Configured Axios instance for calling the Hacker News API:

```typescript
const apiClient = axios.create({
  baseURL: 'https://hacker-news.firebaseio.com/v0',
  // ...
})
```

All API calls in feature modules use this client.

## Time Formatter (`lib/timeFormatter.ts`)

Converts Unix timestamps to relative time strings ("2 hours ago"). Used by the Stories feature to display story timestamps.
