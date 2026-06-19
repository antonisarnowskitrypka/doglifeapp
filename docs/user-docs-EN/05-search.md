# Search

How clients find services on the marketplace.

## What you can search by

- **Main category** — the first criterion on the home screen (e.g. Trainer, Physiotherapy, Photography). Each category has its own color and icon. See also [Provider Setup](./17-provider-setup.md).
- **Tags / names** — pick from a predefined taxonomy (service types, specializations) or match by service name (e.g. *agility*, *behaviorist*, *physiotherapy*).
- **Language** — filter down to providers who speak a language you know. A provider matches if any of their staff speaks the chosen language.
- **Date** *(optional)* — if you pick a specific date, results are narrowed to providers actually available that day. If you leave it blank, you get a general search across all matching providers.
- **Delivery mode** — choose how the service is delivered:

| Mode | Meaning |
|---|---|
| **ONLINE** | A remote session. Available only for services the provider has marked as online (usually consultations). |
| **MY HOME** | The provider travels to you. |
| **LOCATION** | You travel to the provider's location. |

## Pet species

By default the search shows only services for the **client's pet species** — e.g. a cat owner sees services that accept cats.

- A future **"More"** menu will include a species selector to change which species you're searching services for.
- A client who has pets of **both species** (a dog and a cat) sees this selector surfaced up front, to switch easily between species.

## Skill level

Some services and courses have a **skill level** (from beginner to advanced). In the **"More"** menu you can optionally narrow results to a chosen level — products with no level set always stay in the results.

## Delivery modes in detail

Every service is offered in one or more of three modes: **online**, **at the client's home** or **at the provider's location**. A provider can have several locations, and each service is linked to the relevant location(s).

### LOCATION search

You provide your location (use your current GPS position or type an address). The platform finds matching services whose provider location is within **30 km** of you.

### MY HOME search

You provide your location. The platform finds only providers who **will come to you** — that is, those whose travel range covers your address. Each provider sets their own travel radius per service, so the results only include those who will actually travel.

### ONLINE search

Location is ignored. You see all providers offering the given service online. Online mode is only available for services the provider has explicitly enabled it for (intended for consultations — training, behavior, nutrition).

## Providing your location

You can:
- Click **"Use my location"** (browser geolocation) — most precise, or
- Type a **city or address** — we convert it to coordinates.

A typed **city** is treated as its **centre**, so results are "around" that city; for the most precise match, use GPS location.

## Cross-category autocomplete

As you type tags/phrases, if your input is a very strong match for a **different** main category, the suggestion appears in the list with **that other category's icon and color**. Selecting it **switches the active category** and refreshes the results.

## How results are ranked

Within the chosen category, we order results by combining several factors:

- **relevance** — how well the service matches the typed tags/name (a hit on the service name counts more strongly),
- **rating** — a higher (weighted) rating boosts the position,
- **distance** — closer = higher (does not apply to **online** search),
- **freshness** — new businesses and services get a temporary visibility bonus that fades over about 30 days from publication,
- **Boost** — providers with a Pro subscription get a slight position bonus (within the same results, with no separate "ad" section).

## Search flow

1. Choose a main category
2. Type tags / a service name (a suggestion from another category may switch it)
3. Optionally pick a date
4. Choose a delivery mode (ONLINE / MY HOME / LOCATION)
5. For MY HOME / LOCATION: confirm your location
6. Browse the results — click a service to start a booking

You can also **save and follow** this search to get notifications about new matching events and providers — see [Follows](./27-follows.md).

---

⬅️ **Previous:** [Pets](./04-pets.md) · **Next:** [Provider Profile](./06-provider-profile.md) ➡️
