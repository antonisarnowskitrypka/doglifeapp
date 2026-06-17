# Availability Builder

How the provider builds a **weekly availability schedule**. This is the UI layer over the availability model in [Calendar & Availability](../dev-docs/06-calendar-and-availability.md) — a fast, block-based editor that compiles into per-staff weekly windows.

There are **two views** sharing the same grid:

1. **Template management** (this is the *preset* editor — sections below up to *Term auto-generation*) — edits the reusable weekly [preset](#schedule-presets); changes nothing concrete until terms are generated.
2. **[Week view](#week-view)** — a single concrete week (real dates), used both to manually add new terms (as a DRAFT) and to view/edit an already-active week. Edits here touch **that week**, not the preset.

## Canvas

The builder opens on an **empty week** pre-filled from the org's **working hours** (`organization.workingHours`, e.g. 9–18 Mon–Sat — a soft default, see [Calendar](../dev-docs/06-calendar-and-availability.md#working-hours)). Days/hours outside the working hours are dimmed but not forbidden.

When the week is empty, a large CTA **"Add first availability slot"** invites the first block. After that, blocks render on the grid and new ones are added with a **"+"**.

## Slot-creation modal

Adding a block opens a modal. Controls, top to bottom — each later control is **filtered by the choices above it**:

1. **Day pills** — Mon…Sun, **all working days selected by default**. The block applies to every selected weekday.
2. **Hours** — start–end, **defaulting to the working hours**. Editable per block.
3. **Staff** — clickable chips / avatars of the org's members; pick **who is available** in this block. (Solo org: just the owner, preselected.)
4. **Delivery mode** — chips **ONLINE / ONSITE / CLIENT**. Shown **only if the provider offers services in more than one mode**; with a single mode, this control is hidden and that mode is implied.
5. **Location** — chips of the org's locations, shown **only when ONSITE** is chosen; pick the location(s) this block serves.
6. **Services** — multiselect dropdown. The list **auto-omits services that can't be delivered** given the choices above — i.e. only services whose `staffIds` intersect the chosen staff, that support the chosen mode, and (for onsite) are linked to the chosen location.
7. **Booking mode** — `book_now` / `request` / `inquiry` for bookings made in this block (maps to the window's `bookingModeOverride`).

Saving the block **compiles it into per-staff weekly windows**: one `availabilityTemplate` window per (selected staff × selected weekday), carrying the chosen hours, `deliveryModes`, `locationIds`, `serviceIds`, and `bookingModeOverride`. Overlapping blocks merge per staff; a clash with an existing window is flagged before saving.

### Why this shape

One block can express a rich rule in a few taps. Worked examples:

| Block | Days | Staff | Mode / Location | Services | Booking mode |
|---|---|---|---|---|---|
| **A** | Mon–Thu | Eliza, Julka | Onsite @ HQ A + Online | all they're qualified for | book_now |
| **B** | Fri | Julka | Onsite @ HQ B | Nosework only | book_now |
| **C** | Fri (morning) | Eliza | Client (travels to clients) | her at-client services | request |
| **D** | Fri (afternoon) | Eliza | Onsite @ HQ A | her onsite services | book_now |

Each compiles to the right per-staff windows, and the services multiselect in C/D only shows what's feasible (Eliza's at-client vs onsite services).

## "Check" before saving

A **"Check"** action runs a quick coverage validation over the schedule being edited (the active preset) and surfaces **suggestions** — it never blocks saving:

- **Every offered service appears at least once.** Each service in the org's catalogue should be in some window's `serviceIds` for at least a moment in the week; the check lists any service that is **never bookable** in this schedule.
- **Every staff member has at least one shift.** Each active member should appear in at least one window; the check flags anyone with **no availability** at all.

Findings render as a dismissible list ("3 services aren't bookable in this schedule: …", "Julka has no shifts"). The provider can **jump to fix** each item or **skip** and save anyway — coverage gaps are intentional sometimes (e.g. a seasonal preset that deliberately drops a service, or a staff member who's off this period). The check is advisory only.

## Schedule presets (up to 3)

The provider can keep **up to three named schedule presets** (e.g. *Regular*, *Summer*, *Holiday*), one marked **active**. Each preset is its own set of blocks/windows. Presets are editable independently in the builder.

**Switching the active preset does NOT regenerate already-generated weeks.** It only changes which preset **future term generation** draws from (below). Generated weeks remember the preset they came from.

## Term auto-generation

Bookable terms for upcoming weeks are produced from the **active preset**, either automatically or by hand (`organization.availabilityGeneration` — see [Calendar](../dev-docs/06-calendar-and-availability.md#availability-generation)):

- **Auto** — pick a **weekday** and a horizon **X weeks ahead**; a scheduled job runs each chosen weekday and materializes the next missing week(s) from the active preset. Example: *every Sunday, add terms for 2 weeks out.*
- **Manual** — auto off; the provider clicks **"Generate next weeks"** to roll the horizon forward from the active preset whenever they want.

A toggle in settings switches between the two; the horizon and weekday are provider-set.

## Week view

A single **concrete week** (real dates), opened in one of two scenarios:

- **Add new terms manually** → *Add new terms* → **choose a preset** → opens the week as a **DRAFT**. The provider tweaks blocks for that week, then **confirms** — which materializes the active terms.
- **View a selected week** that already has **active** terms.

It reuses the same grid and block controls as the template editor, with these differences:

- **Edits scope to this week only**, not the preset. A saved week change does **not** alter the preset; to push it back the provider uses **"Update template"** or **"Save as new template"** (the only two ways an edit reaches the preset — otherwise it stays week-local).
- **Editing an already-active week changes real availability immediately** (it's live bookable supply, not a draft).
- **Absences / time off** for each staff member are shown on the grid (see [Availability Exceptions](../dev-docs/06-calendar-and-availability.md#availability-exceptions-absences)).
- **Events** the staff are running — group events / [recurring-series](../dev-docs/06-calendar-and-availability.md#recurring-event-series) occurrences (`fixed_event`) — are shown on the grid as **committed blocks**. They are **part of the work schedule**: an assigned staff member is **occupied** for the event window (+ buffer), so they're **not offered for other bookings** then. Shown read-only here (events are created/managed in the event flow), visually distinct from availability blocks and 1:1 bookings.
- A **toggle shows/hides existing bookings** overlaid on the grid.
- **"Generate from preset"** — opening a future week with **no terms yet** (manual generation mode) offers a one-tap fill from a chosen preset, as a DRAFT to adjust.
- **Filter by staff** — narrow the grid to one member (readability for larger teams).
- **Copy week → another week** — duplicate this week's **availability layout** (blocks/windows, *not* bookings) onto one or more chosen target weeks. The result opens as a **DRAFT** to confirm. If a target week already has terms, the copy **replaces** its layout; any existing bookings that would collide raise the conflict-safety warning below (never silently dropped).

### Editing active slots — conflict safety

Editing, shrinking, or removing an **active** slot that already has **bookings** raises the same **hard-to-miss warning** used for [absence conflicts](../dev-docs/06-calendar-and-availability.md#availability-exceptions-absences): the affected confirmed bookings are surfaced and **never silently dropped** — the provider resolves them explicitly. New DRAFT terms (scenario 1) show a **DRAFT** badge until confirmed. All times are in the org time zone.

## States to design

Checklist of distinct screens/variants to mock for this component.

**Template view (preset editor)**
- [ ] Empty week — big CTA "Add first availability slot"
- [ ] Populated week — several blocks across days
- [ ] Block selected / hover — edit & delete affordances
- [ ] Overlap / merge — colliding blocks flagged before save
- [ ] Preset switcher — Regular/Summer, active marked
- [ ] Preset limit — "3/3" state (can't add another) + create-new

**Slot-creation modal**
- [ ] Default open — all days selected, hours from working hours
- [ ] Single-mode org — ONLINE/ONSITE/CLIENT chips hidden
- [ ] ONSITE selected — location chips visible
- [ ] CLIENT selected — no location (travel context)
- [ ] Services multiselect open — infeasible items greyed + "why" tooltip
- [ ] Validation / error — no staff, end before start
- [ ] Edit existing block (vs create) — prefilled + delete

**"Check" (coverage)**
- [ ] Check results — suggestions (service never bookable, staff with no shift) + jump-to-fix / skip-and-save

**Week view (concrete week)**
- [ ] DRAFT — after Add terms → choose preset (DRAFT badge)
- [ ] Active terms — viewing an existing week
- [ ] Bookings toggle ON — bookings overlaid
- [ ] Bookings toggle OFF — availability only
- [ ] Absences / time off on the grid
- [ ] Events as committed blocks (e.g. "Group walk • 6/10")
- [ ] Editing an active slot — confirm live availability change
- [ ] Conflict — editing/removing an active slot with bookings (prominent warning)
- [ ] Empty future week (manual mode) — "Generate from preset" CTA
- [ ] Copy week → target-week picker + DRAFT result
- [ ] Staff filter — grid narrowed to one member

**Term generation (settings)**
- [ ] Auto — weekday + "X weeks ahead"
- [ ] Manual — auto off + "Generate next weeks"

**Cross-cutting / states**
- [ ] Light vs dark
- [ ] Mobile (bottom-sheet, day pager / horizontal scroll) vs desktop
- [ ] Solo provider — staff control simplified/hidden
- [ ] Staff with schedule-editing locked — read-only (`staffCanEditOwnSchedule=off`)
- [ ] Pending absence awaiting approval (auto-accept off) — "pending" + owner action
- [ ] Loading / skeleton; saving → success toast
- [ ] Outside working hours dimmed + "now" line

## Related

- Data model, windows, presets, generation: [Calendar & Availability](../dev-docs/06-calendar-and-availability.md).
- Staff ↔ service qualification (drives the services multiselect): [Staff ↔ Service Assignment](../dev-docs/06-calendar-and-availability.md#staff--service-assignment).
- Per-day quick actions (break / boost) and absences live in the day view, not this weekly builder.
