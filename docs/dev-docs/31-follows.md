# Follows

Customers can follow a **provider**, an **event series**, or a **saved search** to get notified about relevant new things.

## Following a Provider

```
// follows
id: string
customerId: string
organizationId: string
createdAt: timestamp
```

Triggers a notification to followers when the provider publishes:

- a **new service**
- a **new event** (`fixed_event`)
- a **new promotion** (discount code / time-limited promotion — see [Provider Business Dashboard](./15-provider-dashboard.md))

Only `active` (published) orgs generate follow notifications.

To avoid spamming provider-followers with every weekly occurrence, a recurring [event series](./06-calendar-and-availability.md#recurring-event-series) fires the **provider "new event"** notification **once on series creation**; subsequent occurrences notify **series followers** instead (below).

## Following an Event Series

```
// seriesFollows
id: string
customerId: string
seriesId: string
organizationId: string
createdAt: timestamp
```

Following an `eventSeries` notifies the customer **whenever a new occurrence is added** — the key channel for the `open` (no-preset-dates) variant where the provider schedules walks spontaneously. Same anti-spam batching as below.

## Following a Search (saved search)

```
// savedSearches
id: string
customerId: string
query: {
  categoryKey: string | null
  tags: string[]
  species: string | null
  languages: string[]
  deliveryMode: string | null
  location: { lat, lng } | null       // for geo searches
  radiusKm: number | null
}
createdAt: timestamp
```

A snapshot of the search criteria. Notifies when something matching appears:

- **Primarily new events** (`fixed_event`) matching the criteria.
- Also **new providers / services** matching the saved search (secondary).

Matching reuses the [search](./13-search.md) filters (category/tags/species/language/geo) against the newly created entity.

## Delivery

- **Immediate, with anti-spam batching.** A notification fires soon after the triggering event, but a burst of changes from the **same provider** (e.g. several services/events published together) is **grouped** into one notification (e.g. "New things at X") rather than many.
- Channels follow the user's [notification preferences](./09-notifications.md) (in-app + push by default; email if enabled).

## Notes

- Unfollow deletes the `follows` / `savedSearches` record.
- Saved-search matching runs server-side on entity creation (reverse-match against stored searches).
