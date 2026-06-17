# Service Categories

Main service categories are a **fixed, platform-managed catalogue** (super-admin), each with a dominant **colour** and **icon** used consistently across the app — search, service listings, provider menus, Life of Pet timeline, etc. (Exact colours/icons are defined later in the UI docs.)

## `serviceCategories` (platform catalogue)

```
key: string            // stable, e.g. 'trainer_behaviourist', 'photography'
name: localized        // display name per locale
colorKey: string       // dominant colour — value TBD in UI docs
icon: string           // icon ref — TBD in UI docs
order: number          // display order
active: boolean
```

Managed centrally by the super-admin (see [Super Admin](./24-super-admin.md)); providers do not create their own.

### Initial categories

`trainer_behaviourist`, `sport_training`, `physiotherapy`, `grooming`, `dietitian`, `facility_rental`, `petsitting`, `photography`.

> **"Events" is not a category.** A group event / [recurring series](./06-calendar-and-availability.md#recurring-event-series) is a *scheduling type* (`fixed_event`), not a main category — every event still belongs to a real category like anything else (e.g. a group walk → `sport_training` or `trainer_behaviourist`, a nutrition webinar → `dietitian`). Same for courses and packages: they carry a normal `categoryKey`.

## Assignment

- **Organization** — `organization.categoryKeys: string[]` — the main categories the provider serves (**one or more**).
- **Service** — `service.categoryKey: string` — each service belongs to **exactly one** main category (must be within the org's `categoryKeys`).
- The provider's service menu is **grouped by `categoryKey`**.

## Search Integration

The main category is the **primary search criterion** (see [Search](./13-search.md)):

- service searchable doc carries `categoryKey`; query filters `where('categoryKey', '==', selectedCategory)`.
- **Cross-category autocomplete**: while typing tags/terms, a strong match belonging to a *different* category is shown in the suggestion list with **that category's icon + colour**; selecting it **switches the active category** and re-runs the search.

## Cross-Cutting Display

Category `colorKey`/`icon` are surfaced wherever a service or service-derived item appears: search results, service cards, provider profile menu, and Life of Pet timeline entries generated from bookings (the entry inherits its service's category colour/icon).
