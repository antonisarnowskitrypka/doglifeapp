# Provider Profile

When a client opens a provider's profile, the page is split into three tabs.

## SERVICES

The provider's list of services. Each service leads directly into the booking flow.

- Browse the available service types and prices
- Click a service to start a booking (see [Booking a Service](./07-booking-a-service.md))

## ABOUT

Information about the organization:

- Company details
- Description — **short** (always shown next to the name/avatar) and **long** (after "show more")
- Reviews / ratings (see [Reviews](./14-reviews.md))
- Certificates

**Staff** and **services** also have a short and a long description — the short one accompanies the name/avatar, the long one expands after "show more" (the exact appearance is in the UI docs).

## CHAT

A general client–provider chat for pre-booking questions.

- Lets a client ask questions **before** making a booking
- The conversation is with the organization (not with a specific staff member)
- Useful for clarifying details, availability or choosing a service

> Note: within a single booking there is no chat — communication happens through **comments on attachments and recommendations** in the [Session Workspace](./12-session-workspace.md). The exception is **group events**, which have a separate group chat (see below).

### Visit proposal in chat

In the chat the provider has a visible **"Propose a visit"** action. It creates a proposal card — **this is not a booking** (there's no pet selected yet, no questions and no terms), just a **shortcut** to a booking with the day, service, mode and price pre-filled.

- The **price** defaults to the standard one for the given mode, but the provider can change it (edit icon) before sending.
- The client can **open** the proposal — a booking opens with the data pre-filled. "Pre-accepted" only means we skip the 24h provider confirmation — **the client still has to go through the standard steps**: select a pet, answer the provider's **required questions** (aggression, attitude towards other animals, etc.) and accept the terms, and then **pay right away**. Or the client can **delete** the proposal.
- The proposal **does not block the slot and does not expire** — it lives until the provider deletes it or the slot gets taken. Whoever books and pays first wins.

## Group event chat

A group event (e.g. a group walk, a seminar) has its own chat that gives context to **the whole group of all enrolled** participants and the provider.

- Only currently enrolled participants have **access**. Once you cancel your enrollment, you lose access to the chat.
- **Client mode** (a thread setting) — you can choose whether your messages go to **everyone** in the group or **only to the provider**. In "provider only" mode the message goes to your regular [profile chat](./06-provider-profile.md) (client↔organization), not to the group chat.
- The **provider** can write to the whole group or switch to a **1:1 conversation with any member** — that conversation also takes place in the profile chat (client↔organization).
- This way **all 1:1 correspondence with the provider is in one place** — in the profile chat — while the group chat stays purely group-focused.
- **After the event** the chat stays active for another 7 days (to wrap up conversations), then becomes read-only and is automatically deleted after about 30 days.

---

⬅️ **Previous:** [Search](./05-search.md) · **Next:** [Booking a Service](./07-booking-a-service.md) ➡️
