# PR 28 Follow-up Issues

These are the remaining items from `missing-implementation.md` that PR 26 and PR 27 do not cover. Drafted for review before opening GitHub issues.

## Issue 1: Implement real story and comment creation

**Problem:** `POST /api/stories` and `POST /api/stories/:id/comments` still return placeholder responses. They do not persist `Item` documents, update parent `kids`, or increment `descendants`.

**Acceptance criteria:**
- Authenticated users can create stories and comments in MongoDB.
- Created comments are attached to their parent item through `parent` and `kids`.
- Story `descendants` updates when a comment is added.

## Issue 2: Add ownership-aware delete and edit behavior

**Problem:** Delete behavior is placeholder-only, and there is no comment edit endpoint. The API cannot enforce author/admin ownership yet.

**Acceptance criteria:**
- Only the item author, moderator, or admin can delete an item.
- Deleted items are marked consistently without breaking comment trees.
- Comment edit support is defined or explicitly deferred.

## Issue 3: Persist vote state and user vote history

**Problem:** `PUT /api/stories/:id/vote` returns a fake score delta. The user model has no vote history, so duplicate votes cannot be prevented.

**Acceptance criteria:**
- Votes are persisted per user and item.
- Repeated vote calls toggle or reject consistently.
- Item score updates atomically.

## Issue 4: Extend user profile schema

**Problem:** The current `User` schema supports auth, roles, and ban state, but not karma, submissions, comments, or vote history.

**Acceptance criteria:**
- User profile includes karma and activity references or derivable fields.
- Profile fields support story/comment ownership checks.
- Sensitive auth fields remain excluded from public responses.

## Issue 5: Add backend validation and request hardening

**Problem:** Route handlers use manual validation only. There is no validation library, operator sanitization, request size policy beyond Express defaults, `helmet`, or rate limiting.

**Acceptance criteria:**
- Auth and posting routes validate body, params, and query fields with shared schemas.
- NoSQL operator injection is blocked on user-controlled objects.
- Security headers and rate limits are enabled for sensitive routes.

## Issue 6: Standardize API errors and response envelopes

**Problem:** Controllers return ad hoc `{ message }` responses. Error shape, status codes, and internal error handling are not centralized.

**Acceptance criteria:**
- API errors use one consistent response shape.
- Controllers delegate unexpected errors to shared error middleware.
- Client-visible messages do not leak internal details.

## Issue 7: Add environment validation

**Problem:** The server reads `MONGO_URI`, `JWT_SECRET`, and `PORT` directly without startup validation.

**Acceptance criteria:**
- Required env vars are validated before the server starts.
- Missing or invalid config fails fast with a clear startup message.
- `.env.example` documents required backend variables.

## Issue 8: Add OpenAPI docs and Postman collection

**Problem:** There is no machine-readable API documentation or Postman collection for current routes.

**Acceptance criteria:**
- OpenAPI spec documents auth, story, item, comment, vote, and delete routes.
- Swagger UI is available in development.
- Postman collection matches the OpenAPI route contract.

## Issue 9: Add frontend error boundaries and responsive polish

**Problem:** Pages show some query/form errors, but there is no app-level error boundary or full fallback flow for unexpected render/API failures.

**Acceptance criteria:**
- App has a reusable error boundary.
- Story list and item page have consistent empty/error/loading states.
- Auth and story pages are checked on narrow mobile widths.

## Issue 10: Decide scope for real-time and microservice features

**Problem:** The checklist includes ranking workers, WebSocket notifications, and Mongo change streams, but the current app has no architecture for them.

**Acceptance criteria:**
- Team decides whether these are required for grading or stretch goals.
- If required, define a small first slice and interface contract.
- If deferred, document the decision in project docs.
