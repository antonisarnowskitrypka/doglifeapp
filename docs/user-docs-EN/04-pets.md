# Pets

A user can have several pets. Each pet has its own record, history and Life of Pet timeline.

## Registering a pet

The minimum needed to register a pet:

- Name
- Species (dog or cat)
- Sex (male or female)
- Date of birth
- Breed

Every pet has a **species** — dog or cat — chosen at registration. The app currently supports dogs and cats.

That's enough to get started. Later the owner can add more details, for example:

- A **photo / avatar** of the pet
- Microchip number
- Passport number
- Neutering / spaying status
- Pedigree
- …and other documents (see [Life of Pet](./15-life-of-pet.md))

## Multiple pets

- An owner can register any number of pets.
- In the **Life of Pet** tab the owner chooses which pet they are currently viewing.
- When adding a **custom Life of Pet event**, the owner can add it to **several pets at once** — e.g. a shared vaccination or a shared vet visit, with separate results for each pet (result A for pet A, result B for pet B).
- For services that accept several pets (events, group walks, some consultations) the owner can select **several pets** in a single booking.

## Pet questions (handling)

A pet record stores the answers to standard questions that many providers require before a service, for example:

- Is the pet aggressive?
- Attitude towards dogs
- Attitude towards cats
- Fears / triggers

These come from a **platform-defined catalog**. A provider can mark some of them as **required** for their service — see [Booking a Service](./07-booking-a-service.md). When the owner answers them during a booking, the answers are saved on the **pet record** and reused: for every subsequent provider who requires the same question, the answer is pre-filled automatically.

> Handling answers are functional safety data stored on the pet. Unlike Life of Pet timeline events (which the owner shares explicitly), they are automatically visible to any provider who requires them.

## Illnesses and contraindications

A pet record has a separate, important field for **illnesses and contraindications** (e.g. cancer, advanced dysplasia). This is safety-critical data — it is **always shown front and center** to the provider taking the booking (and in the session), with no need to share it manually. The owner enters it as free text.

## When a pet passes away or is removed

In the pet's **danger zone** the owner can:

- **"Crossed the rainbow bridge"** — mark the pet as deceased. The entire history is preserved, but services can no longer be booked for it.
- **Delete** — completely remove the pet.

---

⬅️ **Previous:** [User Roles](./03-user-roles.md) · **Next:** [Search](./05-search.md) ➡️
