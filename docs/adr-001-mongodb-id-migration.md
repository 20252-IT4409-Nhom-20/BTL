# ADR 001: Migration to MongoDB ObjectId References

**Status:** Implemented (Task 34)
**Date:** 2026-06-04

## Context
The project was previously mixing legacy Hacker News numeric IDs with MongoDB native `_id`s. This created inconsistency, as relationship logic (`parent`, `kids`) relied on numeric IDs, preventing us from using native MongoDB/Mongoose features efficiently.

## Decision
1.  **Identity:** Adopted `ObjectId` as the primary key (`_id`) for all items.
2.  **Relationships:** Updated `parent` and `kids` fields in `ItemSchema` to use `mongoose.Schema.Types.ObjectId`.
3.  **Legacy IDs:** Maintained the numeric `id` field as an optional, secondary property for legacy data support/reference, but deprecated it for internal logic.
4.  **Migration:** Implemented a one-time migration script (`be/scripts/migrateToObjectId.js`) to convert existing numeric relationship data into `ObjectId` references.

## Consequences

### Schema Changes
*   **ItemSchema:**
    *   `parent`: Changed from `Number` to `ObjectId` (ref: 'Item').
    *   `kids`: Changed from `[Number]` to `[ObjectId]` (ref: 'Item').
    *   `id` (Number): Now marked `required: false` (sparse index).

### Migration Requirement
**Crucial:** Existing databases must run the migration script before application code is deployed, or relationship traversal (tree building) will fail due to type mismatch.

```bash
# Run from be/ directory
node scripts/migrateToObjectId.js
```

### API Interface Changes
Endpoints now interact with `_id` (String representation of ObjectId) instead of numeric `id`.

#### POST /stories
*   **Request:** Accepts standard story fields.
*   **Response:** Includes the new `_id`.

#### POST /comments
*   **Request:**
    ```json
    {
      "text": "...",
      "parent_id": "6a21a0734de99965fd8086a6" // Must be a valid ObjectId string
    }
    ```

### Integration Notes for Frontend
*   All frontend components must navigate using `_id`.
*   Any lookups or link generation using the old numeric `id` should be updated to use the `_id` string.
*   The API automatically handles the distinction: `getItemWithComments` accepts either a valid `ObjectId` string or a legacy numeric `id` (for backward compatibility during transition).
