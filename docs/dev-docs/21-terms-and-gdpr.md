# Provider Terms & GDPR

Per-provider terms of service and GDPR/privacy policy, with versioned customer acceptance.

## `providerPolicies`

```
id: string
organizationId: string
kind: 'terms' | 'privacy'
version: number                 // incremented on each published change
contentUrl: string              // or inline content field
publishedAt: timestamp
active: boolean                 // the current version for this kind
```

One active version per `(organizationId, kind)`. Publishing a new version increments `version` and supersedes the previous active one.

## `policyAcceptances`

```
id: string
userId: string
organizationId: string
policyId: string
kind: 'terms' | 'privacy'
version: number                 // the version the user accepted
acceptedAt: timestamp
bookingId: string | null        // the booking that prompted acceptance
```

## Acceptance Logic (at booking)

Before creating a booking, the server checks, for each `kind`:

```
latest = active policy for (org, kind)
accepted = policyAcceptances for (user, org, kind) where version == latest.version
if !accepted → require acceptance now, write a policyAcceptances record
```

- Acceptance is **per provider**, not per booking — a returning customer is not re-prompted.
- A **new published version** (higher `version`) invalidates prior acceptance → re-prompt on the next booking.
- This check is part of the [booking prerequisites](./05-booking-state-machine.md#booking-prerequisites).

## Notes

- Versioning gives the provider an audit trail of exactly which text each customer agreed to.
- Policy content can live in Firebase Storage (`contentUrl`) or inline; either way reads/writes go through server routes.
