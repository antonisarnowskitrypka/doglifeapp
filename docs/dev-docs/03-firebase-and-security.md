# Firebase & Security

## SDK Split

The Firebase SDK is split between client and server to enforce the security boundary.

### Client (frontend)

Allowed operations:
- `firebase/auth` — authentication state, sign-in/sign-out
- FCM token registration for push notifications
- Optional real-time `onSnapshot` subscriptions for display purposes

Not allowed:
- Direct Firestore reads or writes
- Direct Storage writes
- Any business logic execution

### Server (backend — Nuxt Server Routes)

All business logic runs here via Firebase Admin SDK:
- Firestore CRUD
- Firebase Storage reads/writes
- Admin operations
- Stripe webhook handling
- Authorization checks

## Security Model

Firestore is a database, not an application layer. Business rules are enforced in server routes and domain services — never in Firestore security rules.

Firestore rules should be **locked down** to deny all direct client access (except auth-scoped reads needed for real-time subscriptions, if used).

## Firebase App Check

Enabled to prevent unauthorized API clients from calling Nuxt server routes or Firebase services directly.

## Environments

Two separate Firebase projects — **`doglife-dev`** and **`doglife-prod`** (proposed names; not created yet) — plus a **LOCAL** environment on the Firebase Emulator Suite. Each project has its own Auth, Firestore, Storage, App Check apps, service account, and FCM sender; config never crosses between them. Full setup, env vars, and external-service modes are in [Development Setup](./10-development-setup.md#environments).

## Examples of Server-Only Operations

- Creating or cancelling a booking
- Processing or refunding a payment
- Creating or consuming a session package
- Writing session notes
- Managing staff membership
- Handling review creation
