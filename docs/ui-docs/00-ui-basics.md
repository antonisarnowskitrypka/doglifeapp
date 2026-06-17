# UI Basics (Design System Foundation)

The shared visual language for the whole app — tokens, type, components, and calendar-specific styling. Screen-level specs (e.g. [Availability Builder](./01-availability-builder.md)) build on this. Exact brand assets/illustrations come later; this pins down tokens concrete enough to hand to a generator (see [Stitch prompt](#stitch-prompt)).

**Brand vibe:** friendly & warm, trustworthy pet-care. Soft rounded shapes, generous breathing room, mobile-first and touch-friendly. Clean, not noisy.

## Color Tokens

Colors are driven by **Nuxt UI color aliases over Tailwind palettes** — we don't hand-maintain hex, and **light/dark are generated automatically**. Set in `app/app.config.ts`:

```ts
ui: { colors: { primary: 'teal', neutral: 'stone' } }
```

- **`primary` = `teal`** — the brand accent (buttons, links, active states, calendar availability).
- **`neutral` = `stone`** — surfaces, borders, and text; gives dark mode its warm-grey base.

### Semantic colors (Nuxt UI aliases)

Use Nuxt UI's semantic aliases in markup, never raw hex: **`primary`**, **`secondary`**, **`success`**, **`info`**, **`warning`**, **`error`**, plus the neutral roles **`text`/`muted`/`dimmed`**, **`bg`/`elevated`/`accented`**, **`border`**. These resolve correctly in both themes. Default mappings (success→green, info→blue, warning→yellow, error→red) can be overridden in `app.config.ts` if needed.

### Category palette

One Tailwind palette per main [service category](../dev-docs/28-service-categories.md) — referenced by name (e.g. `text-blue-500`, `bg-orange-500/10`), not bespoke hex. **Provisional — final mapping TBD with brand:**

| Category | Tailwind color |
|---|---|
| `trainer_behaviourist` | `blue` |
| `sport_training` | `orange` |
| `physiotherapy` | `green` |
| `grooming` | `violet` |
| `dietitian` | `amber` |
| `facility_rental` | `slate` |
| `petsitting` | `pink` |
| `photography` | `cyan` |

(Note: `physiotherapy` uses `green` while `primary` is `teal` — distinct enough; revisit if they read too similarly on dense grids.)

## Typography

- **Family:** `Plus Jakarta Sans` (friendly geometric) for everything; system-font fallback (`-apple-system, Segoe UI, Roboto, sans-serif`).
- **Scale (px / weight / line-height):**

| Role | Size | Weight | LH |
|---|---|---|---|
| Display | 32 | 700 | 1.2 |
| H1 | 24 | 700 | 1.25 |
| H2 | 20 | 600 | 1.3 |
| H3 | 17 | 600 | 1.35 |
| Body | 15 | 400 | 1.5 |
| Small | 13 | 400 | 1.45 |
| Caption / label | 12 | 500 | 1.4 |

## Spacing, Radius, Elevation

- **Spacing scale (px):** `4, 8, 12, 16, 20, 24, 32, 40, 48` (4-based). Default screen padding 16 (mobile) / 24 (desktop).
- **Radius:** `sm 8`, `md 12`, `lg 16`, `xl 20`, `pill 999`. Default card/control radius **12–16** (rounded & airy).
- **Elevation (light):** `e1` cards `0 1px 2px rgba(16,26,25,.06), 0 1px 3px rgba(16,26,25,.04)`; `e2` sheets/popovers `0 8px 24px rgba(16,26,25,.12)`. Dark mode uses border + subtle glow instead of heavy shadows.
- **Hit target:** min 44×44.

## Core Components

Prefer **Nuxt UI** components (`UButton`, `UBadge`, `UModal`, `USelectMenu`, `UTabs`, `UAvatar`, `USwitch`, …) and their `color`/`variant`/`size` props over custom markup; wrap any component used more than twice (see [CLAUDE.md conventions]). Below, color names are the Nuxt UI semantic aliases.

- **Buttons** — `UButton` with `color="primary"` (filled teal), `variant="outline"`/`subtle` (secondary), `variant="ghost"`, or `color="error"`. Sizes sm/md/lg. Big CTA = primary lg block on mobile.
- **Chips / pills** — selectable. **Day pills** (Mon–Sun, multi-select), **mode chips** (ONLINE/ONSITE/CLIENT), **location chips**; selected = `bg-primary/10` + `primary` text/border. **Staff chips** = `UAvatar` + name, selected ring in `primary`.
- **Segmented control** (`UTabs`/`UButtonGroup`) — booking mode (book_now / request / inquiry).
- **Multiselect dropdown** (`USelectMenu`) — services picker (with disabled/omitted items).
- **Cards** (`UCard`) — `elevated`/`bg`, radius `lg`.
- **Modal / bottom-sheet** (`UModal` / `USlideover`) — bottom-sheet on phones, centered modal on desktop.
- **Toggle / switch** (`USwitch`) — `primary` when on (e.g. show/hide bookings).
- **Avatars** (`UAvatar`) — initials fallback, status ring.
- **Badges** (`UBadge`) — `Confirmed` (`success`), `Pro` (`primary`), `New` (`info`), `Boost` (`primary` subtle + ⚡), `DRAFT` (`warning` outline).
- **Toasts / inline alerts** (`UAlert`/`useToast`) — `success`/`warning`/`error`; conflict warnings are **prominent** (`error`, icon, can't be missed — see safety rules in dev docs).
- **Empty states** — friendly illustration + one-line guidance + primary CTA (e.g. "Add first availability slot").

## Calendar-Specific Styling

The calendar grid (week view) is the centerpiece. Block types must be **instantly distinguishable**:

| Element | Styling |
|---|---|
| **Availability block** (bookable supply) | soft `bg-primary/10` fill, `primary` left-accent bar, category dot(s) |
| **1:1 booking** | solid `elevated` card, category-colored left bar, client+pet name; hidden/shown by the bookings toggle |
| **Event** (`fixed_event`) | stronger filled block in its category hue at reduced saturation + a small "group" icon; reads as a committed block (occupies staff) |
| **Absence / time off** | neutral diagonal-hatch on `muted` surface, `dimmed` label |
| **DRAFT** (new terms, not confirmed) | dashed `primary` border, 70% opacity, `DRAFT` badge |
| **Conflict** (edit hits a booking) | `error` outline + warning icon, prominent |
| **Boosted slot** | `Boost` badge ⚡ + `bg-primary/10` |
| **Outside working hours** | dimmed grid background |

Grid: weekday columns × time rows; sticky day header with date; "now" line in `primary`. Mobile: horizontally scrollable days or a single-day pager. (Token names above are Nuxt UI/Tailwind semantic classes — see [Color Tokens](#color-tokens).)


## Related

- Screen specs: [Availability Builder & Week view](./01-availability-builder.md).
- Category colours/icons (final values): tracked in [ui-notes.md](../ui-notes.md) and [Service Categories](../dev-docs/28-service-categories.md).
