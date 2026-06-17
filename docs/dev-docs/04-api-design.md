# API Design

## Approach

OpenAPI-first. Every server route has an OpenAPI schema defined before implementation.

## Implementation

Nuxt Server Routes (`server/api/` and `server/routes/`).

The server layer acts as the sole backend — all Firestore access, business logic, and authorization happens here.

## Documentation

API docs are served via `@scalar/nuxt` — automatically generates a Scalar UI from the OpenAPI spec.

Access locally at: `http://localhost:9000/_scalar` (or configured path).

## Auth

Every protected route verifies the Firebase ID token from the request header using the Admin SDK.

```
Authorization: Bearer <firebase-id-token>
```

## Conventions

- Routes follow REST conventions where appropriate.
- Complex state transitions (booking, package consumption) are modelled as explicit action endpoints rather than generic PATCH.
- All mutations go through server routes — never direct Firestore writes from the client.
