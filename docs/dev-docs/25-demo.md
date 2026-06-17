# Demo Page

A public, sign-up-free guided tour of the provider experience over fake data, with button-triggered event simulation. Fully isolated from production.

## Data Isolation

- Demo data lives in a **separate namespace** — dedicated demo collections (or a `demo_` prefix), never mixed with real collections.
- A static, **read-only seed** defines the base demo organization (services, staff, calendar, clients, pets, history, reviews).
- Each visitor session gets an **ephemeral overlay** keyed by a session id; simulated changes are written only to the overlay (short TTL) and never to the base seed or production data.
- A scheduled cleanup purges expired demo sessions.

## Guided Tour

- A predefined sequence of steps walks the visitor through the key provider screens (dashboard, calendar, booking detail, finances).
- Screens render from the seed + session overlay, so they look and behave like the real UI.

## Event Simulation (button-triggered)

The visitor clicks to trigger events; each appends to the **session overlay** and the UI reacts as it would in production:

| Button | Effect (overlay only) |
|---|---|
| Simulate new booking | inserts a booking, updates calendar, raises an in-app notification |
| Simulate payment | updates escrow/earnings figures |
| Simulate review | adds a review + recomputes the demo profile rating |

- No real Stripe calls — payments are **mocked**.
- No real notifications — push/email are **suppressed**; only in-app demo notifications render.

## Implementation Notes

- Demo server routes read seed + overlay and write only to the overlay; they reuse the same view logic as production where practical, with a demo data source injected.
- Session id in a cookie/URL token; overlay docs carry `expiresAt` for cleanup.
- See [Conventions](./00-conventions.md) for soft-delete/cleanup patterns and [Storage](./23-storage.md) (demo media, if any, also namespaced).
