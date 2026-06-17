# Banning a Client

Provider-level (per organization) ban of a customer. Not platform-wide.

## Model

### `clientBans`

```
id: string
organizationId: string
customerId: string              // the owner being banned
reason: string | null
bannedBy: string                // staffId who issued the ban
bannedAt: timestamp
active: boolean                 // false once lifted
liftedAt: timestamp | null
```

A ban is keyed by `(organizationId, customerId)`; query active bans by that pair.

## Enforcement (server-side)

### On ban creation

1. Create the `clientBans` doc (`active: true`).
2. Find this customer's **future confirmed** bookings with the org and cancel each with a **full refund**, using provider-cancellation semantics (no customer penalty) — see [Booking State Machine](./05-booking-state-machine.md).

### On new booking attempts

Booking creation routes reject any attempt by a customer with an active ban for the target organization (covers all the customer's pets).

## Lifting

Set `active: false`, `liftedAt`. The customer can book again afterwards. Re-banning creates a new active record (or reactivates), keeping history for audit.

## Access Control

- Issued by **Owner/Staff** of the organization.
- Platform-wide bans are a separate super-admin concern, not modelled here.
- Enforced in server routes, not Firestore rules (see [Firebase & Security](./03-firebase-and-security.md)).
