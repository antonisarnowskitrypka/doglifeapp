# Permissions Matrix

MVP roles: **Owner**, **Staff**, **Customer**. Roles apply **per organization** via `organizationMembers` — a user can be Owner of one org and Staff of another (see [Accounts & Membership](./20-accounts-and-membership.md)). All checks are enforced server-side.

## Provider Side (within an organization)

| Capability | Owner | Staff |
|---|---|---|
| Manage organization profile, locations, services | ✅ | ❌ |
| Manage staff (invite/remove) | ✅ | ❌ |
| Manage terms & GDPR policies | ✅ | ❌ |
| Manage equipment registry | ✅ | ✅ |
| Manage discount codes & promotions | ✅ | ❌ |
| Connect/manage Stripe & payouts | ✅ | ❌ |
| Manage own calendar & availability | ✅ | ✅ (own) — weekly schedule subject to org `staffCanEditOwnSchedule`; absences subject to `staffAbsenceAutoAccept` (else Owner approval) |
| Approve/reject staff absence requests | ✅ | ❌ |
| Conduct sessions, write notes/recommendations/homework | ✅ | ✅ (own bookings) |
| Create/cancel/reschedule bookings, price adjustments | ✅ | ✅ (own bookings) |
| Assign staff to services; reassign a booking's staff | ✅ | ❌ |
| Ban a client | ✅ | ✅ |
| **View finances — whole organization** | ✅ | ❌ |
| **View finances — own only** | ✅ | ✅ (view-only, their own earnings/stats) |
| View org-wide statistics | ✅ | ❌ |
| Generate/view client invoices | ✅ | ✅ (own bookings) |

### Staff finance rule

Staff see **only their own** financial data (their earnings and personal stats), and **view-only** — never the whole company's finances, and no editing. The Owner sees everything. (Owners are also working staff, so they naturally have the staff capabilities too.)

### Guest event leaders

A **guest leader** is an outside instructor invited to co-run a single course/event without joining `organizationMembers` (see [Courses: guest leaders](./08-packages.md#guest-leaders)). Only the **Owner** invites/revokes them. Their grant is **staff-equivalent but fenced to that one event**:

| Capability (scoped to the event) | Guest leader |
|---|---|
| Read/write the group-event chat | ✅ |
| Session workspace: notes, recommendations, upload materials | ✅ |
| View enrolled participants + their pets (handling, conditions) | ✅ |
| Anything outside the event (other bookings, finances, org settings, staff) | ❌ |
| Receive payouts / appear in org finances | ❌ |

They can be **reviewed separately** from the host org; the rating attaches to their person-level reputation only (see [Reviews](./16-reviews.md#subject-organization-vs-guest-leader)).

## Customer Side

| Capability | Customer |
|---|---|
| Manage own profile, company billing details | ✅ |
| Manage own pets (incl. deceased/delete) | ✅ |
| Book / cancel / reschedule own bookings (per refund policy) | ✅ |
| Accept provider terms & GDPR | ✅ |
| Write reviews for own completed bookings | ✅ |
| Manage Life of Pet timeline & share events per provider | ✅ |
| Confirm/dispute service completion | ✅ |

## Notes

- Guest users (no account) can book and pay, but have no profile, pets, history, or referral rewards (see booking flow).
- Platform/super-admin capabilities (disputes, platform-wide bans, platform invoices, moderation) are a separate, non-org-scoped concern — see [Super Admin](./24-super-admin.md).
