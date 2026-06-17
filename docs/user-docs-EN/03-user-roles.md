# User Roles

## Client

A pet owner.

They can:
- browse the marketplace
- book services
- manage their pet's profile and history
- buy training packages
- communicate with the provider in the session workspace

## Owner

The person who created an organization and manages it (e.g. a pet training school).

They can:
- configure the organization profile and services
- add and manage staff
- manage their own calendar and staff calendars
- handle payments and Stripe Connect onboarding
- review all bookings and client history

> The owner is also a staff member — most organizations on the platform are one-person businesses.

## Staff

A staff member within an organization.

They can:
- run sessions
- write session notes and recommendations
- manage their own calendar and availability
- handle clients in the session workspace

---

## Role scope in the MVP

The MVP covers: **Owner**, **Staff**, **Client**.

There is no extended RBAC beyond these three roles in the first release.

## One account, many roles

Roles are not assigned exclusively to an account. The same person can be the **Owner** of their own organization and at the same time a **Staff** member in another — there is one login, and the role applies per organization. See [Creating an Account](./02-accounts.md) — sign-up, profile (avatar/bio) and the staff invitation process.

---

⬅️ **Previous:** [Creating an Account](./02-accounts.md) · **Next:** [Pets](./04-pets.md) ➡️
