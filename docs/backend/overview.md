# Backend API & Database

The backend is an **Express.js** web application designed to act as a RESTful resource provider, currently transitioning from static mockup stores to a persistent database framework.

## Architecture & Layers

```text
be/src/
  ├── config/          # Database configuration and engine startups
  ├── routes/          # API Route endpoints definitions
  ├── controller/      # HTTP Request-Response handling and validations
  ├── middleware/      # Cross-cutting layers (JWT Auth, Error recovery)
  └── models/          # Database Schemas (Mongoose)
```

---

## Technical Patterns

### 1. Database Connection & ORM
- We utilize **Mongoose** as an Object Document Mapper (ODM) to communicate with **MongoDB Atlas** clouds.
- Connection configurations utilize clean environment injection (`process.env.MONGO_URI`) through `.env` configurations.

### 2. Authentication Middleware
The application enforces stateless access token flows:
- Authenticated endpoints look for a Bearer JWT Token in request headers.
- The `authMiddleware.js` parses, validates, and decodes the token.
- On successful validation, the authenticated context (`req.user`) is injected directly into subsequent route controller scopes.

### 3. RESTful Routing Conventions
Endpoints are organized cleanly by logical resources:
- `/api/auth` (User login, registrations)
- `/api/item/:id` (Uniform resource fetching for all structural types)
- `/api/stories` (Creating, upvoting, deleting, or commenting on feeds)
