# Provider Setup

## Organizations

Every provider belongs to an organization — even a solo trainer is their own organization. This model allows future growth (adding employees) without structural changes.

Example: *Dog Academy Sofia* with employees Ivan, Maria, and Georgi.

## Onboarding steps

A newly created provider account is **hidden** (`draft`) — it doesn't appear in search, the profile isn't public, and it doesn't accept bookings. On the home screen you see a **checklist** of things to do:

1. Register and create an organization
2. Connect a Stripe account (Stripe Connect onboarding)
3. Choose main categories and add services (booking mode + delivery modes)
4. Add locations (if the service is "at a location")
5. Set availability (weekly schedule)

Once all the required items are ready, a big **"Publish"** button appears — once clicked, the profile becomes active: visible in search, public, and ready for bookings (and indexed for SEO).

## Main service categories

The platform has a fixed list of **main categories**, each with its own **color and icon** (visible in search, on services, in Life of Pet, etc.):

| Main category | Examples |
|---|---|
| Trainer / behaviorist | Training consultation, obedience, behavioral advice |
| Sports training | Agility, dog frisbee, nosework, show preparation |
| Physiotherapy | Physio visit, massage, Indiba, water treadmill, training plan |
| Grooming | Various grooming categories |
| Nutritionist | Nutrition consultation |
| Facility rental | Training room, outdoor area |
| Petsitting | Walk, stay at the client's, boarding |
| Photography | Pet photo session, outdoor session, event photography |

> **"Events" is not a separate category.** A group event (e.g. group walk, seminar, webinar) has **its own normal category** like any service — e.g. a group walk → Sports training or Trainer, a nutrition webinar → Nutritionist. Being "recurring" and "group" is a way of running it (see [Recurring events](#recurring-events)), not a category.

- The provider chooses a **list of main categories** they offer (there can be several).
- Each service is assigned to **exactly one** main category.
- In the provider's service menu, services are **grouped per category**.

The provider can also add their own custom service types within a main category.

## Recurring events

An event (e.g. a group walk, a workshop) can be **recurring** — that is, a series with its own indexed subpage that collects subsequent occurrences. There are **two ways to set dates**:

- **Several dates in advance** — you add several dates right away (e.g. regular walks every Friday). Specific occurrences are created.
- **No dates set** — you know you'll repeat it, but you don't know when (spontaneously, depending on weather and traffic). You add dates later, one by one.

> **Important:** each occurrence is **fully independent** — it has its own capacity, sign-ups, group chat, session workspace, reviews, and certificate. Changing or canceling one date doesn't affect the others. Occurrences inherit default settings from the series (price, capacity, location, session template), which you can override per date.

On the series page the client signs up for a single date or **selects several at once** and pays together (separate bookings are still created). They can also **follow the series** to get a notification about a new date — especially for the variant with no dates set. See [Follows](./27-follows.md).

## Accepted species

In settings the provider specifies which species they accept: **dogs**, **cats**, or **both**.

- If they accept **both species**, they can choose the species per service (e.g. some services dogs only, others cats only, and still others for both).
- If they accept **only one species**, all their services are for that species by default.

This setting determines who the services are shown to in [search](./05-search.md).

## Booking mode per service

Each service can be set to one of three modes:
- **BOOK_NOW** (default) — the client picks a time and pays right away, the booking is confirmed instantly
- **REQUEST** — the client picks a time and pays, but you have 24h to confirm: you can approve, propose a different time (one change), or cancel; no response within 24h = auto-cancellation and refund
- **INQUIRY** — the client submits an inquiry, you quote it, the client pays

Petsitting works in INQUIRY mode by default. For flow details: [Booking Lifecycle](./10-booking-lifecycle.md).

## Locations & delivery

On the **"Locations & delivery"** screen you set — once for the whole business — how you deliver services, via three switches:

- **Online (remote)** — internet consultations, no location.
- **Travel to the client** — you give a **single base address** and a **travel radius** (slider); we show a static-map preview of the reach. Only clients within that radius find you in a "My home" search.
- **Locations** — places clients come to. You can add several:
  - an **address** (e.g. a studio, a room) — with its own name and an optional photo,
  - **"in the field"** — a loose area (city / neighbourhood) for when you arrange to meet e.g. in a park; you set the area's reach, and publicly we show only an approximate area.

After you enter an address we convert it to a point on the map and show a **static map preview** to confirm. **A location must be correctly located before its services appear in search.** If you work from home, you can **hide the exact address** — publicly we show only an approximate area. If the address can't be found (a new development, a rural area), you can enter coordinates manually.

These are **company-wide** settings — in each service you then choose which of the enabled modes it uses (and at which locations).

## Delivery modes per service

**For each service the provider chooses which modes it supports** — not every service has to be online, not every one with travel to the client. A service appears in a given search mode only if that mode is enabled for it.

Each service is offered in one or more delivery modes — this determines how it appears in [search](./05-search.md):

| Mode | Configuration |
|---|---|
| **At a location** | Link the service to one or more of your locations. |
| **At the client's home** | Enable travel on the service. The base address and **travel radius** are company-wide (set once on the "Locations & delivery" screen). Only clients within that radius will find the service in a "My home" search. |
| **Online** | Enable per service. Intended for consultations (training, behaviorism, nutrition). |

A service can combine modes (e.g. a consultation available both online and at a location).

**Each mode has its own price.** For a single service you can set separately the price for delivery at a location, for travel to the client, and online. All your physical locations share the same "at a location" price. The travel price is fixed for now (a per-kilometer surcharge will come after the MVP).

## Languages

The platform is international, so language matters for discovery.

- **Each employee** marks which languages they speak.
- The organization's languages are the **sum** of the languages of all its employees.
- In [search](./05-search.md), clients can filter to providers who speak a language they know — a provider matches if **any** of their employees speaks that language.

## Staff and services

For each service you assign the **staff members who deliver it**. Example: a school offers *training*, *behaviour* and *nosework* — Eliza takes *training* and *behaviour*, Julka takes *training* and *nosework*. (In a solo business the owner delivers everything.)

- A service's free slots are the **union of the availability** of the staff assigned to it.
- When booking, the client can pick a specific staff member or leave it as **"Any available"** — then the system assigns the **least-loaded** free person for that day (see [Booking a Service](./07-booking-a-service.md#choosing-a-staff-member)).
- The owner can **reassign the staff member** on a booking — only to someone who delivers that service. If the chosen person is busy at that time, the change is still allowed but with a **prominent calendar-conflict warning**.

## Calendar and availability

### Company working hours

In settings you set the company's **fixed working hours and days** (e.g. 9–18, Mon–Sat). This is a **soft default** — it pre-fills the empty calendar and the default hours in the schedule builder; you can still create slots outside it when needed.

### Default weekly schedule

You build the schedule in a **builder** (see [Availability Builder](../ui-docs/01-availability-builder.md)): on a week grid you add **blocks**, and in each you choose days, hours, **staff**, mode (online / at the client's / at a location), location, and **services** (the builder omits services that aren't feasible for the chosen people/location) plus the booking mode. One block compiles into per-staff windows. Before saving you can click **"Check"** — the app flags whether each of your services is bookable at least for a moment in the schedule and whether every staff member has at least one shift (the suggestion can be skipped).

You can keep **up to 3 named schedules** (e.g. *Regular*, *Summer*), with one **active**. Switching the active one **doesn't change already-generated weeks** — it only decides which schedule future term generation draws from.

### Generating time slots

Terms for upcoming weeks are produced from the **active schedule**:
- **Automatically** — pick a **weekday** and **how many weeks ahead** (default 3); on that day the system tops up the missing weeks (e.g. *every Sunday, add terms 2 weeks out*).
- **Manually** — turn auto off and add the next weeks by hand whenever you want.

### Time grid and buffer

- **How often clients can book** — you set whether the client books only on the hour, every 30 minutes, or every 15 minutes.
- **Operational time (buffer)** — after each meeting you can reserve time to rest/prepare. The client sees the service duration, and the system makes sure the next slot starts only after the buffer (e.g. a 50-min service + 10 min for you to grab water). You set the buffer per service (with a global default).

### Time off (exceptions)

A separate **"Add time off"** path — it overrides the calendar without going into a specific day and window. It grays out a whole day or part of it (e.g. vacation, doctor's appointment).

If there are already confirmed bookings during the blocked time, they are **not** deleted automatically — they show up for you to handle. They will be displayed **very prominently** (to be marked when designing the UI), so you never miss a scheduled appointment.

### Staff schedule permissions

In company settings the owner controls two independent toggles (both on by default):

- **Staff can edit their own schedule** — when off, only the owner sets a staff member's weekly schedule.
- **Auto-accept time off** — when on, a staff member's time-off applies immediately; when off, it waits for the **owner's approval** (and until then it does **not** block slots — they remain bookable). Time off added by the owner always applies immediately.

### Quick actions in the day plan

Going into your day plan and seeing a "gap" between clients, you can with one tap:
- **Block it as a break** — no one will sign up there (without digging into calendar management),
- **Boost the slot with a promotional price** — this specific slot appears publicly with a reduced price and a promo badge, to sell it quickly.

Every organization has a **time zone**; hours and slots are interpreted in it (DST automatically). Clients see hours in the provider's time zone.

## Staff (STAFF)

In the **STAFF** tab the owner adds team members by **email**. The person receives an invitation, and once they accept it, their account is linked to the organization as an employee. If they don't have an account yet, the invitation stays pending until they register. See [Creating an Account](./02-accounts.md).

## Terms & GDPR

A provider can publish their own terms and GDPR/privacy policy, which clients accept at booking — see [Provider Terms & GDPR](./08-terms-and-gdpr.md).

## Google Calendar integration

In settings **each employee** can connect their own Google calendar.

- **One-way sync** (platform → Google): bookings and time off/blocks are pushed to the employee's Google calendar.
- Changes **in Google don't affect** the platform — editing or deleting an event in Google won't change or remove a booking. It works one way only (platform → Google).
- **Google Meet links** for online sessions are created automatically when Google is connected. You can also enter your own link (Meet/Zoom/other), and disable auto-generation of links in settings.

## Logo and signature (certificates)

In settings you can upload the organization's **logo** and a **signature in PNG**. These are used on automatically generated [certificates](./28-certificates.md) for events and courses.

## Guests and registration

By default clients can book as guests (without an account). In settings you can **disable guest support** and require registration — then booking with you requires an account.

## Manual bookings

A provider can add bookings manually — handy for walk-in or phone clients. Cash/custom payment has no commission. A booking for a **registered** client can also be sent for payment via **Stripe** — then the standard commission applies (per the provider's plan) and normal escrow (see [Payments](./09-payments-and-refunds.md)).

---

⬅️ **Previous:** [Follows](./27-follows.md) · **Next:** [Equipment Registry](./18-equipment.md) ➡️
