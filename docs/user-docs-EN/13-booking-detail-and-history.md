# Booking Detail & Client History

When a provider opens a booking from the booking list, they land on a single screen about that particular client and pet (e.g. **"Antek & Lanza"** — owner + pet). Before the appointment, this gives the provider a quick view of everything that matters in this relationship.

The client sees **the same layout** from their own booking panel.

The relationship is keyed per **owner + pet** — a client with two pets has two separate histories with the same provider.

## Layout — three tabs

At the bottom of the screen:

### BOOKING

Managing the current booking: recommendations, homework, notes, attachments, status. This is the [Session Workspace](./12-session-workspace.md).

### CHAT

The general client–provider conversation (the same [chat from the profile](./06-provider-profile.md)). One thread per client, available here for convenience.

### HISTORY

The full history of working together for this owner + pet:

- Previous bookings with this provider (dates, services, statuses)
- Recommendations and notes from earlier appointments
- **Shared events from the pet's life** — selected events the owner chose to share (see below)
- **Metric comparison** — collected session data in a **table: rows = sessions, columns = metrics** (e.g. a physio tracks speed/strength/heart rate visit after visit)

## Sharing events from the pet's life

The owner can enrich the provider's view with relevant events from the pet's life — e.g. a visit to another specialist or test results — so the provider has fuller context before the session.

How it works:

- From the owner's booking panel (the same three-tab layout), in **HISTORY**, the owner selects which events from the pet's life to share with this provider.
- All events from the pet's life are **private by default** — nothing is visible to the provider until the owner explicitly shares it. This also applies to events from visits to other providers.
- Sharing is **per provider (organization)** — once an event is shared, it is visible to that provider across all bookings and throughout the entire history with them.
- Sharing is **revocable** — the owner can withdraw access to a previously shared event at any time.

Events from the pet's life come from the pet's timeline (see [Life of Pet](./15-life-of-pet.md)) — both those added manually by the owner (vet visits, test results) and activities generated automatically from bookings on the platform.

---

⬅️ **Previous:** [Session Workspace](./12-session-workspace.md) · **Next:** [Reviews](./14-reviews.md) ➡️
