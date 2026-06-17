# Notifications

## Architecture

```
Firestore document write / status change
  ↓
Cloud Function trigger
  ↓
Notification Service (domain module)
  ↓
  ├── FCM (push)
  ├── Resend (email)
  └── Firestore `notifications` collection (in-app)
```

## Channels

| Channel | Provider |
|---|---|
| Push | Firebase Cloud Messaging |
| Email | Resend |
| In-app | Firestore-backed, read by the frontend |

## Language & Preferences

- Notifications are rendered in the user's chosen app language (`users.locale`). Launch locales: `pl`, `bg`, `en` (extensible). Templates are keyed by event + locale.
- Per-user preferences control channels and individual event toggles:

```
// users.notificationPrefs
{
  channels: { inApp: boolean, push: boolean, email: boolean },
  events: { [eventKey: string]: { inApp?: boolean, push?: boolean, email?: boolean } }
}
```

The Notification Service checks `notificationPrefs` before dispatching on each channel.

## Analytics Emission (shared triggers)

The same Firestore triggers that fire notifications on `bookings` status changes, `reviews` creation, and `conversations/{id}/messages` creation **also emit `analyticsEvents`** (booking_*, no_show, review_received, message_first_response) for the [Analytics & Insights](./34-analytics-and-insights.md) pipeline — one emission call inside the existing handler, no separate trigger infrastructure. Rollups reuse the scheduled-Cloud-Function pattern below.

## FCM Token Management

- Tokens are registered client-side using the Firebase SDK.
- Stored per user in Firestore (server write, or direct auth-scoped write if needed).
- Tokens must be refreshed and stale tokens pruned on `messaging/registration-token-not-registered` error.

## Triggered Events

### Provider

| Event | Trigger |
|---|---|
| New booking | `bookings` doc created with `pending` status |
| REQUEST awaiting confirmation | Transition to `awaiting_provider_confirmation` (24h to act) |
| Booking cancelled | Status transition to `cancelled` |
| New profile chat message | Message doc created in a `conversations` thread (customer → staff) |
| Assigned to a booking | `booking.staffId` set/changed to this staff member (incl. Owner reassignment — see [Calendar](./06-calendar-and-availability.md#staff--service-assignment)); the previously assigned staff is also notified of removal |
| Equipment inspection due | Scheduled Cloud Function scanning `equipment.nextInspectionAt` (in-app only) |
| Staff absence request to approve | Staff creates a `pending` `availabilityExceptions` while `staffAbsenceAutoAccept=false` (Owner notified — see [Calendar](./06-calendar-and-availability.md#staff-schedule-permissions)) |
| Staff absence decision | Owner approves/rejects a `pending` absence (the requesting staff member is notified) |
| Goodwill refund requested | Customer submits a `goodwillRefundRequests` doc on a late-cancel/no-show booking (see [Payments](./07-payments.md#goodwill-refund-requests)); reminder fires before `expiresAt` |
| Pet-life event shared | `petEventShares` doc created with an active grant (in-app only) |
| Invited as guest leader | `eventGuestLeaders` doc created with `invited` status (see [Courses: guest leaders](./08-packages.md#guest-leaders)) |

### Customer

| Event | Trigger |
|---|---|
| Booking confirmed | Status transition to `confirmed` |
| New time proposed (REQUEST) | Transition to `reschedule_proposed` |
| Auto-cancelled (no provider confirm) | `awaiting_provider_confirmation` → `cancelled` after 24h + refund |
| Goodwill refund decision | Provider grants (full/partial refund and/or session restore) or declines a `goodwillRefundRequests` (see [Payments](./07-payments.md#goodwill-refund-requests)) |
| Booking rescheduled | `startDatetime` updated on a confirmed booking |
| Assigned staff changed | `booking.staffId` changed by the Owner (customer sees who will now deliver the service) |
| Price increase requested | Status transition to `price_adjustment_requested` |
| Session reminder | Scheduled Cloud Function, 24h before session |
| Homework reminder | Scheduled Cloud Function on the customer's interval; opt-in (`homeworkReminder.enabled`, default off), recurring every `intervalDays` until disabled |
| Review request | Scheduled Cloud Function, 24h after `completed` (covers the separate guest-leader review when the event had one) |
| Followed provider published | New service/event/promotion by a followed org (batched — see [Follows](./31-follows.md)) |
| New event-series occurrence | A new occurrence added to a followed [event series](./06-calendar-and-availability.md#recurring-event-series) (batched) |
| Saved search match | New event/provider/service matching a `savedSearches` query |
| Certificate issued | `certificates` doc created (event ended / package fully used) |

## Health Reminders (post-MVP)

Scheduled Cloud Functions check vaccination/deworming dates and fire notifications at user-configured intervals (defaults: 2 weeks + 1 day for vaccination; 1 week + 1 day for deworming).
