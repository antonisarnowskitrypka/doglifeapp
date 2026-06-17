# Accounts & Membership

User accounts, authentication, and how a single user relates to one or more organizations.

## `users`

```
id: string                      // Firebase Auth uid
email: string
displayName: string
avatarUrl: string | null
bio: string | null
phone: string | null            // optional (collected at profile/booking; not verified for MVP)
phoneVerified: boolean          // reserved — SMS verification deferred (see below)
locale: string                  // 'pl' | 'bg' | 'en' (extensible) — app + notification language
notificationPrefs: object       // channel + per-event toggles (see Notifications)
authProviders: string[]         // 'password' | 'google.com' | 'apple.com'

companyDetails: {               // optional — for company invoices
  name: string
  taxId: string
  address: string
} | null

createdAt: timestamp
```

When present, `companyDetails` can be used as the invoice `buyerSnapshot` if the customer requests a company invoice (see [Provider Business Dashboard](./15-provider-dashboard.md)).

## Authentication

Via Firebase Auth:

- Email + password
- Google (`google.com`)
- Apple (`apple.com`)

### Phone verification — deferred (not in MVP)

Mandatory SMS phone verification is **dropped for now**. `phone` is optional (collected at profile/booking time) and `phoneVerified` stays a reserved field defaulting to `false` — no gate on it. Revisit when anti-abuse for [referral](./18-referrals.md) farming becomes a priority (post-MVP), at which point we'd add SMS OTP + server-side **uniqueness/reuse limits** on verified numbers.

## Membership Model

A user relates to organizations through membership records — **a user can hold several memberships** (e.g. owner of their own org, staff at another).

### `organizationMembers`

```
id: string
organizationId: string
userId: string | null           // null while an invite is pending registration
role: 'owner' | 'staff'
shortDescription: string | null   // professional blurb shown by the staff avatar/name
longDescription: string | null    // expandable detail ("show more"); see Conventions
languages: string[]             // spoken languages (ISO-ish codes); see Search
avatarUrl: string | null        // org-scoped staff photo (e.g. in company shirt); falls back to users.avatarUrl
status: 'active' | 'invited' | 'pending'
invitedEmail: string | null     // the email the owner entered
invitedAt: timestamp | null
acceptedAt: timestamp | null
```

- `active` — bound and accepted.
- `invited` — a matching user exists; awaiting their acceptance.
- `pending` — no account yet for `invitedEmail`; binds on registration + acceptance.

## Becoming a Provider

The provider creator wizard:

1. Creates an `organization` with **`status: 'draft'`** (hidden — not in search, profile not public, cannot receive bookings).
2. Creates an `organizationMembers` record for the creator with `role: 'owner'`, `status: 'active'`.

The owner is also a working staff member (most orgs are solo — see [Users & Organizations](../user-docs/03-user-roles.md)).

### Onboarding checklist & publishing

A `draft` org's home screen shows an **onboarding checklist**, computed server-side. Required items before publishing:

- Stripe Connect onboarded
- Availability / weekly schedule set
- At least one service
- At least one location (only if a service uses the `at_location` mode)
- At least one main category selected

When all required items are complete, the **"Publish"** action flips the org to `status: 'active'` (live in search, public profile, bookable). `organization.status` values: `draft` → `active`, plus `suspended` (super-admin; see [Super Admin](./24-super-admin.md)). Only `active` orgs appear in search and accept bookings.

## Staff Invite Flow

1. Owner enters an email in the STAFF tab.
2. Server creates `organizationMembers` with `role: 'staff'`:
   - matching user found → `status: 'invited'`, `userId` set.
   - no matching user → `status: 'pending'`, `userId: null`.
3. The invitee **accepts** → `status: 'active'`, `userId` bound, `acceptedAt` set.
4. A `pending` invite resolves to `invited` when someone registers with `invitedEmail`.

## Access Control

- A user's effective permissions come from their `organizationMembers` records (role per org).
- All membership changes go through server routes (see [Firebase & Security](./03-firebase-and-security.md)).
