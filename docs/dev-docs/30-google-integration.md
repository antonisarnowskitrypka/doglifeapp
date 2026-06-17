# Google Integration

Optional per-staff integrations: one-way **Google Calendar** sync (platform → Google) and auto-generated **Google Meet** links for online sessions.

## Connection (per staff)

Each staff member connects their **own** Google account in settings (OAuth). Bookings assigned to that staff sync to their calendar.

```
// staffGoogleIntegration (per organizationMembers / userId)
userId: string
organizationId: string
connected: boolean
googleEmail: string | null
calendarId: string | null          // target Google calendar
refreshToken: string                // stored server-side only (secret)
syncEnabled: boolean                // master toggle for calendar sync
autoMeetLinks: boolean              // auto-create Meet links for online sessions (provider can disable)
```

Tokens live server-side only; all Google API calls go through Nuxt server routes (see [Firebase & Security](./03-firebase-and-security.md)).

## Calendar Sync — one-way (platform → Google)

The platform **pushes** to Google; it does **not** read changes back.

| Platform event | Google action |
|---|---|
| Booking `confirmed` | Create Google event in the staff's calendar |
| Booking rescheduled | Update the mapped Google event |
| Booking `cancelled` | Delete the mapped Google event |
| Absence / break added | Create a blocking Google event |
| Absence / break changed/removed | Update / delete the mapped Google event |

- **One-way only:** editing or deleting an event **in Google does not** change the platform booking/availability. There is no inbound sync (no Google webhook ingestion).
- Bookings **and** absences/blocks sync (so the Google calendar reflects the full schedule).
- A mapping `platformEntityId → googleEventId` is stored per synced item to support updates/deletes.

## Google Meet (online sessions)

For `online` bookings:

- **Auto Meet links are a Pro (subscription) premium feature** (see [Platform Billing](./15-provider-dashboard.md#platform-billing--subscription)). When the org is on Pro, the staff's Google is connected, **and** `autoMeetLinks` is on → the Google event is created with `conferenceData`, yielding a **Meet link** stored on the booking and shown to both parties in the [Session Workspace](../user-docs/12-session-workspace.md).
- A **manual link** (Meet/Zoom/other) is **always available, free** — every provider can paste one regardless of subscription. Only the *auto-generation* is gated.
- The provider can **disable auto-generation** (`autoMeetLinks: false`) in settings — then a manual link is used.
- If the org is not on Pro, Google is not connected, or auto is off → no auto-Meet is created; a manual link applies.

```
// on booking (online)
meetingLink: string | null
meetingLinkSource: 'google_meet' | 'manual'
```

## Notes

- Integration is optional; an org with no connected staff simply has no external sync and uses manual links for online sessions.
- Sync failures are retried/logged server-side and never block the booking itself.
