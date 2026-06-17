# App Shell & Navigation

The frame every screen lives in: **one account, one login, one shell**, with a prominent **context switch** between being a pet guardian and working as a provider. Builds on [UI Basics](./00-ui-basics.md).

## One shell, switchable context

A single user has **one account** and one app shell. A big **"Zmiana kontekstu" (Switch context)** action flips which world they're in:

- **Opiekun** — the consumer/pet-guardian side (search, booking, pets, Life of Pet). *In-app, the user-facing role is called* **"Opiekun"** *(guardian)* — see [Terminology](#terminology).
- **Provider** — working inside an **organization**. A user may belong to **several orgs** (e.g. Owner of their own, Staff at another — see [Accounts & Membership](../dev-docs/20-accounts-and-membership.md)), so the switcher lists **one entry per membership** with its role + org name.

```
Switch context
  ▸ Opiekun (you & your pets)
  ▸ Dog Academy Sofia        — Owner
  ▸ Happy Paws Varna         — Staff
  + Załóż firmę / Become a provider
```

- Switching changes the **navigation, landing (dashboard), and data scope** to that context (the active org for provider contexts).
- The current context is always visible (header chip / avatar), and the switch is reachable from anywhere (one tap).
- Default landing after login = the **last used context** (first-timers → Opiekun, unless they only have provider memberships).

## Terminology

| In-app label | Meaning | Data model |
|---|---|---|
| **Opiekun** | the pet guardian / consumer | customer (+ pet owner) |
| **Owner** | runs an organization | `organizationMembers.role = owner` |
| **Pracownik / Staff** | works in an organization | `organizationMembers.role = staff` |

"Opiekun" deliberately avoids clashing with the provider **Owner** (org owner). *Follow-up: propagate the "Opiekun" label across `user-docs` copy (PL + EN mirror) — not done yet; needs a deliberate sweep.*

## Navigation per context

Mobile-first **bottom tab bar**; desktop promotes the same destinations to a side rail. Dashboard is the **home** of each context.

**Opiekun**
- Dashboard (home) · Szukaj (search) · Rezerwacje (bookings) · Życie zwierzaka (pets/Life of Pet) · Więcej (profile, follows, support)
- Notifications + profile reachable from the header.

**Provider (scoped to the active org)**
- Dashboard (home) · Kalendarz (calendar/week view) · Rezerwacje & Klienci · Panel (finanse, analityka, billing) · Więcej (services, staff, settings)
- Dense screens (calendar, dashboard) open from the home; the calendar is the centerpiece (see [Availability Builder](./01-availability-builder.md)).

## Dashboard (landing) — vision

> Direction captured; **full spec deferred** (we'll revisit). Likely its own `03-dashboard` doc.

A focused home for both contexts, sharing four building blocks:

- **Najbliższa rezerwacja** — the next upcoming booking, front and center.
- **Kluczowe przypomnienia** — Opiekun: pet **health** (vaccination/deworming), **homework**; Provider: things needing action (pending REQUESTs to confirm, absence approvals, goodwill-refund requests, inspections due).
- **Skróty** — quick links to the most important places for that context.
- **Wydarzenia** — Opiekun: **followed** events/series; Provider: the org's **own** upcoming events.

Each block links into its full surface; content is role-aware (Opiekun vs the active org).

## Access model & route scoping

The **marketing site is hosted separately** — this app's `/` is the **in-app dashboard**, not a landing page. `/` shows a **login/register invite** for anonymous users, and the **Opiekun pulpit** when logged in. Without an account, only **Szukaj** and **Ustawienia** (parts of) are usable.

Every page declares a **scope** (`definePageMeta({ context })`), enforced by a global `route-access` middleware (see [Pages & Routes](../dev-docs/35-pages-and-routes.md#access-model)):
- **public** — no login (`/`, `/search`, `/settings`).
- **shared** — any logged-in user, any context (`/notifications`, `/onboarding`).
- **opiekun** / **provider** — context-scoped. Opening a route outside the active context **auto-switches** when the user has a matching membership (Opiekun is always available; provider picks a membership — preferring the **last org worked in** — or routes to `/onboarding`). `/` redirects to `/provider` in an org context.

Context **type** is read from the `dl-context` cookie, so guarding is instant; membership detail loads behind the shell's **skeleton** (no Opiekun→firma flash). Post-login lands on the **active context's** home.

**Auth = modal, not a page.** Login/registration is a global modal (`AppAuthModal`, tabs Logowanie/Rejestracja) opened via `useAuthModal()` — no full-screen `/login`/`/signup`. Anonymous users on a login-required page are **not** force-shown the modal; the shell renders an **`AuthTeaser`** (temporary placeholder; final = illustration + sign-up copy) where the content would be.

## Global patterns

- **Notifications center** + per-event preferences (see [Notifications](../dev-docs/09-notifications.md)).
- **Profile & settings** entry (account, billing details, context memberships).
- Empty / loading / error / toast patterns and components per [UI Basics](./00-ui-basics.md).

## States to design

**Shell & context**
- [ ] Opiekun shell (primary) — tabs + dashboard home
- [ ] Provider shell (active org) — tabs + dashboard home
- [ ] Context switcher — Opiekun + multiple org memberships + "Załóż firmę"
- [ ] Single-context users (only Opiekun / only one org) — switcher minimized or hidden
- [ ] First-time / no-context-yet — default landing logic
- [ ] Current-context indicator in header

**Deep-dive watchpoints**
- [ ] Provider mobile nav — validate bottom-tabs vs a dashboard-drawer for dense screens
- [ ] Switching while mid-flow (unsaved changes guard)
- [ ] Many org memberships (scrolling/grouping in the switcher)
- [ ] Notifications routed to the right context (badge per context?)
- [ ] Deep links opening in the correct context
- [ ] Light vs dark; desktop side-rail vs mobile tabs
- [ ] Guest (no account) — limited shell, prompts to sign up

## Related

- Memberships & roles: [Accounts & Membership](../dev-docs/20-accounts-and-membership.md), [Permissions Matrix](../dev-docs/22-permissions-matrix.md), user [Role users](../user-docs/03-user-roles.md).
- Dashboard data sources: [Provider Dashboard](../dev-docs/15-provider-dashboard.md), [Notifications](../dev-docs/09-notifications.md), [Life of Pet](../user-docs/15-life-of-pet.md), [Follows](../dev-docs/31-follows.md).
