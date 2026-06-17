# Referrals

Referral rewards for client and provider sign-ups. Provider-run discount codes / promotions are separate — see [Provider Business Dashboard](./15-provider-dashboard.md).

## Referral Identity

Each user has a referral code (and shareable link). On registration, an optional `referredByCode` resolves to the referrer's `userId` and triggers the reward flow for the relevant party type.

## Client Referrals

A new client signing up with a valid referral grants a **one-time 5% discount voucher** to **both** the new client and the referrer.

### `referralVouchers`

```
id: string
beneficiaryUserId: string
kind: 'client_referral_discount'
percent: 5
fundedBy: 'platform'
status: 'active' | 'redeemed' | 'expired'
redeemedBookingId: string | null
createdAt: timestamp
```

### Money flow (platform-funded)

Distinct from a provider discount code: the customer pays 5% less, but the **provider's payout is unchanged** and the platform absorbs the discount.

```
customer pays      = base * 0.95
provider payout    = base - standardFee            // as if full price
platform net       = standardFee - (base * 0.05)   // platform funds the 5%
```

Contrast with provider discounts, where the fee is computed on the discounted price and provider+platform share the cost (see [dashboard pricing order](./15-provider-dashboard.md#pricing--commission-order)).

## Provider Referrals

A provider referred by another provider lowers their commission by **−1 p.p.** for **one extra month** — and the referrer also gets **+1 month**. The discount is modelled as a **duration counter**, not a stack of rates:

- **Months stack, percentage points do not.** Each successful provider referral adds **+1 month** to the beneficiary's `providerBilling.referralDiscount.monthsRemaining`; the discount is always exactly **−1 p.p.** while the counter is `> 0`. Three referrals = **3 months at −1 p.p.**, never −3 p.p.
- The discount applies on top of whichever **base tier** the org is on (subscriber → 3.5%, non-subscriber → 6.5%) — see the [commission model](./15-provider-dashboard.md#platform-billing--subscription).
- `monthsRemaining` decrements one per monthly billing cycle, and is **frozen** while a super-admin [custom commission](./24-super-admin.md) is active (the override suppresses all bonuses; banked months are preserved, not burned).
- `platformConfig.referralDiscountPoints` (the 1 p.p.) is platform config, not hard-coded.

Both parties' awards write to their own `providerBilling.referralDiscount.monthsRemaining` via a server route at referral resolution time. The full effective-rate resolution (tier → referral → custom) lives in [Platform Billing & Subscription](./15-provider-dashboard.md#effective-commission-resolution).

## After MVP

- **Cashback** for the referrer — a share of the platform's commission from the referred provider's transactions for a defined period. Modelled later (e.g. a `referralEarnings` ledger).

## Notes

- Reward eligibility is validated server-side at registration and at voucher/override application time.
- Self-referral and abuse checks (same payment instrument, duplicate accounts) are enforced server-side.
