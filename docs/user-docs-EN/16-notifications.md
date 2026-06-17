# Notifications

## Channels

- **In-app** — a notification center inside the platform
- **Push** — via Firebase Cloud Messaging (browser / PWA)
- **Email** — via Resend

## Language

Notifications are sent in the **app language** chosen by the user. Supported at launch: **Polish, Bulgarian, English** (more in the future).

## Preferences

In settings, each user can enable/disable channels and adjust individual notification settings.

## Provider notifications

| Event | Channels |
|---|---|
| New booking | In-app, push, email |
| REQUEST booking awaiting confirmation (24h) | In-app, push, email |
| Cancellation by client | In-app, push, email |
| New message in profile chat from a client | In-app, push |
| Equipment inspection / service due | In-app |
| Client shared an event from the pet's life | In-app |

## Client notifications

| Event | Channels |
|---|---|
| Booking confirmation | In-app, push, email |
| Provider proposed a different time (REQUEST) | In-app, push, email |
| Booking cancelled (no confirmation within 24h) + refund | In-app, push, email |
| Booking rescheduled | In-app, push, email |
| Provider's request for a price increase | In-app, push, email |
| Session reminder | Push, email |
| Homework reminder (recurring, enabled by the client, off by default) | Push, in-app |
| Review request (24h after the service) | Email |
| Certificate issued (event/course) | In-app, push, email |
| Something new from a followed provider (service/event/promotion) | In-app, push |
| New event/provider matching a followed search | In-app, push |

## Health reminders (Life of Pet module)

Reminders about vaccinations and deworming.

Default timings:
- Vaccination: 2 weeks before + 1 day before
- Deworming: 1 week before + 1 day before

The user can customize the reminder schedule.

---

⬅️ **Previous:** [Life of Pet](./15-life-of-pet.md) · **Next:** [Follows](./27-follows.md) ➡️
