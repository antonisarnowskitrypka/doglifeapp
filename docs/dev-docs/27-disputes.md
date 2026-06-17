# Disputes

Booking-tied disputes opened during the 24h completion confirmation window. Resolution is handled by the super-admin (the `disputes` collection and resolution flow are defined in [Super Admin](./24-super-admin.md#disputes--chargebacks)).

## Opening a Dispute

- **Window:** only while the booking is `awaiting_confirmation` (the 24h window after service end — see [Booking State Machine](./05-booking-state-machine.md#service-completion-confirmation-window)). After auto-release there is no in-app dispute.
- **Who:** either party (customer or provider).
- **Action:** a server route transitions the booking `awaiting_confirmation → disputed`, halting escrow auto-release, and opens a `disputes` record.

## Dispute Record (fields added on open)

Extends the `disputes` model in [Super Admin](./24-super-admin.md#disputes--chargebacks):

```
source: 'completion_window'      // vs 'stripe_chargeback'
openedBy: string                 // userId (customer or staff)
reason: string
evidence: Attachment[]           // optional; Storage rules apply
```

## Resolution

The super-admin resolves to **release** (escrow → provider) or **refund** (→ customer), transitioning the booking accordingly and closing the `disputes` record. See [Super Admin](./24-super-admin.md#disputes--chargebacks) and [Payments](./07-payments.md).

## Chargebacks

Stripe `charge.dispute.*` events open a `disputes` record with `source: 'stripe_chargeback'` independently of the 24h window — handled by the same super-admin resolution flow.
