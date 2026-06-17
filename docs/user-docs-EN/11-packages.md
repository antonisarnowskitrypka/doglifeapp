# Packages & Courses

There are two kinds of products built on the same session-consumption mechanic:

- **Package** — a simple set of interchangeable sessions (e.g. *3 massages*). Sold from the profile, without a separate subpage.
- **Course** — a structured program (e.g. *Polite Waiting*) with **its own indexed subpage**, a **lesson curriculum**, and configurable pacing. See below.

## Course

- It has **its own subpage** (indexed by search engines) with a description.
- It has a **lesson curriculum** — named, sequential lessons; each lesson can have its own [session template](./26-templates.md) (materials, metrics).
- **Pacing** (who participates): **individual** or **group**.
- **Date mode** (how times are set):
  - **predefined** — all course dates known in advance (e.g. *Puppy Kindergarten Spring 2026*), you sign up for the whole series,
  - **self-selection** — you book each session from the calendar at your own pace.
- Pacing and date mode are **two independent options** — the provider chooses both. Typically: group → predefined dates, individual → self-selection, but all combinations are allowed.
- It can have an optional **difficulty level** (1–3, from beginner to advanced) — shown on the card and filterable in [search](./05-search.md).
- After completing the course you get a [certificate](./28-certificates.md).

### Course structure (two levels)

A course has content on **two levels** — the shared course "umbrella" and the individual lessons:

```
Course "Polite Waiting"
├── Course materials (shared)        introduction, plan, intro video
├── Course notes and homework         (kept separately for each participant)
└── Lessons (each is a full session, with its own materials)
    ├── Lesson 1 "The Bed"           own materials, metrics, notes…
    ├── Lesson 2 …
    └── …
```

- **Course materials** (introduction, plan, video) are **shared** by everyone enrolled and visible **immediately after signing up**.
- **Course notes and homework** are kept **separately for each participant** (and their pet) — even in a group course. Recommendations and homework appear for the client only once the provider sends them; private notes stay with the provider.
- Each **lesson** is a full [session](./12-session-workspace.md) with its own materials.
- **Lessons unlock in order**: in "predefined" mode — by the lesson date; in "self-selection" mode — after completing the previous one.

### Guest instructor

For a course or event, the provider can invite a **guest instructor** — e.g. another trainer from outside the company. Such a person:

- **does not become** an employee of the company — they only have access to **that one** event,
- can take part in the group discussion, add comments, and upload materials, just like an instructor from the company,
- is shown on the course/event page as a co-instructor,
- after the event can be **rated separately** — that review goes to the instructor's own reputation, not to the company average (see [Reviews](./14-reviews.md)).

The invitation can be revoked at any time — access to the event then disappears.

## Example (package)

> **3 massages** — 3 sessions — 150 EUR

## How it works

1. The client buys a package from the provider's profile
2. The payment goes through Stripe Checkout (the full amount up front)
3. Each booking within the package reduces the number of remaining sessions
4. The session workspace shows the session number within the package

## Session consumption rules

| Situation | Effect |
|---|---|
| Early cancellation (within the free window) | The session returns to the pool |
| Late cancellation (after the free window) | The session is forfeited — `remaining--` |
| No show | The session is forfeited — `remaining--` |
| Completed session | The session is forfeited — `remaining--` |

## Certificate

After completing a **course**, the client automatically receives a [PDF certificate](./28-certificates.md). Regular packages don't have a certificate by default.

## Package state

Each purchased package tracks:
- `totalSessions` — the original number of sessions purchased
- `remainingSessions` — sessions still available to use

---

⬅️ **Previous:** [Booking Lifecycle](./10-booking-lifecycle.md) · **Next:** [Session Workspace](./12-session-workspace.md) ➡️
