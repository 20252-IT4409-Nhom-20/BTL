# Coding Guidelines

This project utilizes highly structured guidelines to keep code clean, predictable, and simple to collaborate on across both Frontend and Backend workspaces.

---

## 1. Directory Structure Rule: Feature-Isolation
* **1 feature = 1 folder** inside feature boundaries (e.g., `fe/src/features/`).
* **Keep code close to where it's used** → Keep components, custom hooks, types, and API utilities for a specific domain scoped strictly inside that feature folder.
* **No Cross-Feature Imports:** Feature folders must not import directly from other feature folders. Use shared components or state in global namespaces if reuse is required.

---

## 2. Component Design (Frontend)

### 2.1 Keep Components Small and Focused
❌ **Avoid nested render methods:**
```jsx
function StoryList() {
  function renderItem() {
    return <tr>...</tr> // Nesting is anti-pattern
  }
  return <table>{renderItem()}</table>
}
```

✅ **Split into descriptive subcomponents:**
```jsx
function StoryItem({ story }) {
  return <tr>...</tr>
}

function StoryList() {
  return <table><StoryItem {...story} /></table>
}
```

### 2.2 Property Limits
Limit functional components to less than 5 props. If a component needs more, utilize composition, context providers, or pass object bundles instead.

---

## 3. Naming Conventions

| Category | Case / Format | Example |
|---|---|---|
| File Names (.jsx, .js) | `kebab-case` | `story-card.jsx` |
| Folder Names | `kebab-case` | `features/story-list/` |
| Component Names | `PascalCase` | `function StoryCard()` |
| Hook Names | `camelCase` (prefixed with `use`) | `useStories()` |
| Global Constants | `UPPER_SNAKE_CASE` | `ITEMS_PER_PAGE = 30` |
| General Variables | `camelCase` | `const pageNumber = 0` |

---

## 4. State Management Priority
When implementing reactivity, follow this order of preference:
1. **Local State (`useState`):** Keep state local to individual components whenever possible.
2. **URL State (`?page=1`):** Use for pagination, filters, or persistent routing states.
3. **Shared Global State (`useContext` or Zustand):** Reserve only for user identity, themes, or global modals.
