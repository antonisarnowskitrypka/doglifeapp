# Development Setup

## Prerequisites

- Node.js (see `.nvmrc` or `package.json` engines if present)
- npm (bundled with Node.js)
- Firebase CLI installed globally (with the Emulator Suite for local work) — `npm i -g firebase-tools`
- Access to the **two Firebase projects** — DEV and PROD (see [Environments](#environments)) — each with Auth, Firestore, Storage, FCM, and App Check configured
- A Stripe account with Connect enabled (test mode for LOCAL/DEV, live for PROD)

## Environments

Three environments across **two** Firebase projects:

| Environment | Firebase | External services | Purpose |
|---|---|---|---|
| **LOCAL** | **Firebase Emulator Suite** (Auth, Firestore, Functions, Storage) — no cloud traffic | Stripe **test**, Resend **sandbox** | Day-to-day development, fully isolated; data is disposable |
| **DEV** | Firebase project **`doglife-dev`** (cloud) | Stripe **test**, Resend **sandbox** | Shared integration/staging: QA, demo, deploy previews |
| **PROD** | Firebase project **`doglife-prod`** (cloud) | Stripe **live**, Resend **production** | Live platform |

> The two Firebase projects are **not created yet** — `doglife-dev` / `doglife-prod` are **proposed names**; adjust once the projects exist.

Key rules:

- **LOCAL never touches the cloud.** All Firebase calls hit the local emulators; the Nuxt server routes/Admin SDK connect to emulator endpoints via `FIREBASE_*_EMULATOR_HOST` env vars. Seed/erase freely.
- **Two real projects only** — `doglife-dev` and `doglife-prod`. They are fully separate Firebase projects (separate Auth users, Firestore data, Storage buckets, App Check apps, service accounts, FCM senders). Never point DEV config at PROD or vice versa.
- **Project aliases** live in `.firebaserc` (`firebase use dev` / `firebase use prod`); deploys are environment-scoped. CI deploys DEV on merge to the integration branch and PROD on release.
- **External services follow the environment**, not the developer: Stripe runs in **test mode** (test keys, separate Connect accounts, separate webhook signing secret) on LOCAL + DEV, and **live mode** only on PROD; Resend uses a sandbox sender on LOCAL/DEV and the verified production domain on PROD. Webhook endpoints are registered per environment.
- **Secrets** are per environment and never committed: emulator/local values in `.env.local`, cloud values supplied to DEV/PROD by the deploy platform's secret store. The Admin service-account JSON differs per project.

## Install

```bash
npm install
```

## Dev Server (LOCAL)

```bash
npm run dev                 # → http://localhost:9000, wired to the emulators
```

`npm run dev` auto-starts the Firebase Emulator Suite (Auth, Firestore, Storage) if it
isn't already running, waits until it's ready, then starts Nuxt. Emulators it starts are
stopped when you stop the dev server; if you already have emulators running they're reused
and left untouched. Emulator data is ephemeral — it's not persisted between runs.

Escape hatches:

```bash
npm run emulators           # start only the emulators (e.g. in a separate terminal)
npm run dev:nuxt            # start only Nuxt, without touching the emulators
```

LOCAL runs against the Emulator Suite (see [Environments](#environments)); no cloud project is touched.

## Type Check

```bash
npm run typecheck
```

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Environment Variables

The **same variable names** are used in every environment — only the **values** change per environment (see [Environments](#environments)). LOCAL values go in `.env.local`; DEV/PROD values come from the deploy platform's secret store. Never commit cloud secrets.

```
# Firebase (client) — DEV vs PROD project values; emulator on LOCAL
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=        # doglife-dev | doglife-prod
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only) — service account differs per project
FIREBASE_SERVICE_ACCOUNT_KEY=   # JSON string or path

# Firebase Emulators (LOCAL only) — set to route SDKs at the emulators
FIRESTORE_EMULATOR_HOST=        # e.g. 127.0.0.1:8080  (unset in DEV/PROD)
FIREBASE_AUTH_EMULATOR_HOST=    # e.g. 127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST= # e.g. 127.0.0.1:9199

# Stripe — test keys on LOCAL/DEV, live keys on PROD
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=          # per-environment webhook signing secret
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend — sandbox sender on LOCAL/DEV, production domain on PROD
RESEND_API_KEY=
```

## Development Conventions

1. **Spec first** — write the domain spec before touching code.
2. **OpenAPI first** — define the server route schema in OpenAPI before implementing it.
3. **Server routes for all mutations** — no direct Firestore writes from the client.
4. **State machines for status transitions** — booking status, package state, etc.
5. **Mobile first** — design and test on mobile viewport before desktop.
