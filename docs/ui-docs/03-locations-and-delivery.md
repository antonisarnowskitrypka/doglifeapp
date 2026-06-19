# Locations & Delivery

Interaction/layout spec for **`/provider/locations`** — where a provider declares *where and how* it delivers services. Data model + geocoding live in [Search → Delivery Model](../dev-docs/13-search.md#delivery-model) and [Geocoding & Maps](../dev-docs/36-geocoding-and-maps.md); this doc pins the screen's controls and rules.

## Purpose

Two layers, both on this screen:

1. **Org-level gates** — three master switches declaring what the business does at all.
2. **Shared config** — the single `at_client` travel base + radius, and the list of locations.

Per-service mode selection (which of the enabled modes a given service uses) happens on `/provider/services`, *not* here.

## Layout

A single owner-only card, `max-w-2xl`, titled **"Lokalizacje i dojazd"** with a one-line subtitle. Staff see a read-only `UAlert` instead. Heading **"Tryby realizacji"**, then three toggle rows separated by `USeparator`. A primary **Save** in the card footer persists the gates + travel base/radius + country in one `PATCH /api/orgs/[orgId]/delivery`.

Each toggle row: title + muted description on the left, `USwitch` on the right. Turning a switch **on** reveals that mode's inline panel (bordered, `mt-4`).

### 1. Online (zdalnie)

No panel — just the gate. Online services need no location.

### 2. Dojazd do klienta (travel to client)

Panel reveals:
- **Adres bazowy** — `AppAddressAutocomplete` (server-proxied Geoapify typeahead). Picking a suggestion stores its coordinates directly; free-typing invalidates the resolved point and is geocoded on Save as a fallback.
- **Promień dojazdu** — `USlider` (`TRAVEL_RADIUS` bounds 1–100 km) with a live `{km} km` readout.
- **Reach preview** — `AppStaticMap` centred on the base with a translucent **radius circle**. Dragging the slider re-renders a *debounced static image* (~400 ms) — never an interactive map. If no base is resolved yet, a warning `UAlert` ("set a base address to be findable") replaces the preview.

One address, one radius — shared by every `at_client` service.

### 3. Lokacje (locations / in the field)

Panel reveals the **location list** + two add buttons: **"Dodaj adres"** (`fixed`) and **"Dodaj „w terenie”"** (`area`). Empty state is a dashed placeholder.

Each list row: thumbnail (photo → cached map → kind icon), name (+ "W terenie" badge for areas), address/city line, and a `geoStatus` badge (`Zlokalizowano` / `Sprawdź dokładność` / `Nie znaleziono`). Trailing **edit** (pencil) and **delete** (trash) icon buttons. Delete opens a confirm `UModal`.

## Location modal (`fixed` / `area`)

Opened by add/edit. Title switches by kind. Fields:

- **Nazwa** — custom label (placeholder differs per kind).
- **Adres** (`fixed`) / **Miasto / obszar** (`area`) — `AppAddressAutocomplete`. Hidden when manual-coordinates is on.
- **Współrzędne ręcznie** (`USwitch`) — advanced escape hatch for un-geocodable spots; reveals lat/lng number inputs (`precision: 'manual'`).
- **Zasięg obszaru** (`area` only) — `USlider` (`AREA_RADIUS` 1–60 km) around the centroid.
- **Pokaż dokładny adres publicznie** (`fixed` only) — off ⇒ home-studio privacy (approximate public display). `area` is always coarse.
- **Preview** — `AppStaticMap`: exact pin for a public fixed venue; **approximate** (no rooftop pin, area circle) for `area` or a non-public fixed location. A warning replaces it until the point resolves.
- **Zdjęcie miejsca** — `AvatarUploader`, shown only when editing (needs a saved location id). Add the photo after the first save.

Save is disabled until there's a name + a resolvable point (pick, geocodable text, or manual coords). On save the server derives `h3` + `geoStatus` + `searchCells` and caches the static map.

## Rules

- **`area` semantics** — "in the field": a city/region centroid the provider covers within `areaRadiusKm` (e.g. meeting in a park). Coarse by design; shows "okolice {miasto}", never an exact pin.
- **Search visibility** — only `geoStatus == 'ok'` locations get valid `searchCells` and appear in search; surfaced on the onboarding checklist.
- **No dynamic maps** — every map is a server-proxied static image; "live" previews are debounced re-renders (see [Geocoding & Maps → Static map](../dev-docs/36-geocoding-and-maps.md#static-map)).
- **i18n** — all copy under `provider.locations.*` + shared `geo.*`; no hardcoded strings (see [conventions](../dev-docs/00-conventions.md#i18n)).

---

⬅️ **Previous:** [App Shell & Navigation](./02-app-shell-and-navigation.md)
