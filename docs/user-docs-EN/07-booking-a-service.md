# Finding and booking a service

## Discovery

Clients browse the marketplace by service type, location, or provider. Provider profiles and service listings are publicly indexed for SEO.

## Booking modes

The provider chooses a mode per service. There are three:

### BOOK_NOW — instant booking (default)

The client picks a time slot, pays, and the booking is confirmed right away.

### REQUEST — slot pending confirmation

The client picks a slot and **pays immediately**, but the booking waits for provider confirmation (up to 24h). The provider can:

- **approve** → booking confirmed,
- **propose a different time** → it goes back to the client (only **one** such change — so the booking doesn't bounce back and forth forever; further arrangements via chat). The client accepts (confirmed) or rejects (cancellation + full refund),
- **cancel** → full refund.

If the provider doesn't respond within 24h, the booking is automatically cancelled with a full refund.

### INQUIRY — on request (with a quote)

The default mode for pet sitting. Any provider can enable it for any service.

Flow:
1. The client submits an inquiry
2. The provider reviews it and sends a quote
3. The client pays
4. The booking is confirmed

## Booking as a guest

A client can book without creating an account.

Flow:
1. They provide an email address
2. A guest account is created automatically
3. A magic link is sent to the email
4. The guest can later activate a full account

Guests **don't need a phone number** (they don't receive referral rewards, so there's no abuse vector). However, the provider can mark the **phone number as a required field** in the sign-up form for their service — then the guest must provide it in order to book.

The provider can also **disable guest support** and require registration (guests enabled by default). In that case, booking with them requires an account.

## Pricing and VAT

The price depends on the chosen **delivery mode** — the same service can have a different price at a location, with travel to you, and online (see [Search](./05-search.md)).

Prices are shown **including VAT**, with a note such as *"price includes 23% VAT"* based on the provider's VAT rate. A client with [company details](./02-accounts.md) can request an invoice issued to their company.

## Step by step: instant booking

1. Open the provider profile or service listing
2. Choose a service
3. Pick an available day and time
4. Review the booking details
5. Go to Stripe Checkout
6. Receive confirmation (email + push notification)

## Choosing pets

During booking, the client selects which pet the service is for. Services that accept several pets (events, group walks, some consultations) let you select **several pets at once**. Each pet takes one slot; the price is charged per pet or per booking, depending on the service configuration. See [Pets](./04-pets.md).

## Choosing a staff member

If a service is delivered by several staff members, you can pick a **specific person** or leave it as **"Any available"** (the default):

- **Specific staff** — you see only that person's free slots.
- **Any available** — you see the slots of everyone who works on that service, and after booking the system auto-assigns the **least-loaded** free person for that day.

The provider (owner) can later **reassign the staff member** on a booking — you'll be notified who will deliver the service.

## Required questions about the pet

The provider can require answers to standard handling questions (e.g. *is the pet aggressive?*, *attitude toward dogs/cats*) before a booking can be made. During booking:

- Answers already given are pre-filled from the pet record.
- Missing required answers must be completed in order to continue.
- Answers are saved on the pet record and reused for future bookings.

## Accepting the provider's terms

During booking, the client accepts the provider's terms and GDPR policy. This is remembered per provider and only required again if the provider publishes a new version — see [Provider Terms & GDPR](./08-terms-and-gdpr.md).

## Step by step: booking on request (INQUIRY)

1. Open the provider profile
2. Choose a service with INQUIRY mode enabled
3. Describe your needs and send an inquiry
4. Wait for a quote from the provider (the provider sets a deadline for the decision)
5. Review and accept the quote — there's no negotiation
6. Pay via Stripe Checkout before the deadline
7. Receive confirmation

> If the quote isn't paid before the provider's deadline, the inquiry is **automatically cancelled**.

---

⬅️ **Previous:** [Provider Profile](./06-provider-profile.md) · **Next:** [Terms & GDPR](./08-terms-and-gdpr.md) ➡️
