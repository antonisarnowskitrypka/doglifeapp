# Architecture

## Principles

- **Spec Driven Development** — every feature starts with a domain spec → user doc → technical spec → state machine → Firestore schema → implementation.
- **Mobile First** — UI designed primarily for mobile, desktop is fully supported.
- **Serverless First** — Firebase and Cloud Functions over custom infrastructure.
- **Marketplace First** — validate the business model before optimizing the tech.
- **SSR First** — the app runs in SSR mode for SEO, performance, and indexability of marketplace pages.

## Rendering Strategy

The application runs in **SSR mode** by default.

Goals:
- SEO for all marketplace and provider profile pages
- Better initial load performance
- Indexability of services, events, and provider profiles

The homepage (`/`) is prerendered.

## Data Flow

Clients never communicate with Firestore directly. All business logic runs on the server.

```
Browser / PWA
     ↓
Nuxt Server Routes   (business logic, validation, auth checks)
     ↓
Firebase Admin SDK
     ↓
Firestore / Storage / Auth
```

## Firebase SDK Split

### Frontend (client-side)

Only used for:
- Authentication state (sign-in, session token)
- Push notification token registration (FCM)
- Optional real-time subscriptions (read-only, display purposes)

### Backend (server-side)

Used for:
- All Firestore reads and writes
- Firebase Storage operations
- Admin SDK operations
- Stripe webhook processing
- Authorization checks

## Architecture Constraints

Firestore is treated purely as a **database** — not as an application backend.

Business rules live in:
- Nuxt server routes
- Domain service modules
- State machines

**Never** inside Firestore security rules.
