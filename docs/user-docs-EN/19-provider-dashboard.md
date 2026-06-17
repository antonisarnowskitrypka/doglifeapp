# Business Dashboard

Beyond bookings and the calendar, a provider has a business dashboard covering finances, invoicing, settlements with the platform, and promotions.

## Financial summary

An overview of earnings and expenses over a chosen period (e.g. month, quarter, custom range).

- **Earnings** — derived from bookings/payments (platform + manual).
- **Expenses** — two sources:
  - Manual entries added by the provider (rent, supplies, etc.)
  - Equipment service costs pulled automatically from the [Equipment Registry](./18-equipment.md)
- **Per trainer** — for organizations with several staff, earnings and expenses can be broken down per trainer (based on who ran a given booking). Solo providers simply see their own totals.

## QR codes

You can export QR codes for printing (for the front desk) or sharing on social media:

- **Company QR** — leads to your profile,
- **Course QR** — to the course page,
- **Event QR** — to the event page.

Each QR leads to the public, indexed page of the given item; the export comes in a print-ready format.

## Statistics and insights

Full analytics has its own screen — see [Analytics & Insights](./30-analityka-i-statystyki.md). In short:

- **Free (up to 30 days):** views and clicks (CTR), bookings and revenue over time, cancellations/no-shows, **repeat clients**, **top services**, most-booked hours, average response time, average rating.
- **In Pro (up to 90 days):** conversion funnel, forecasts (no AI), demand map and "high demand, no slots" hints, full price comparison against the market, trust score, per-trainer breakdowns.

## Client invoices

The platform can **automatically generate an invoice** for a service, because it already has the details of both the provider and the client.

- Generated **automatically when a booking reaches the `Completed` status** — with no manual step.
- Generated from booking data — no re-entering.
- Issued as a readable PDF document with both parties' details and line items.
- Delivered to the client right away as an **attachment in the [Session Workspace](./12-session-workspace.md)**.
- **MVP:** simplified billing documents (no guarantee of full fiscal compliance — the provider remains responsible for formalities).
- **Later:** full fiscal invoices (sequential numbering, NIP/VAT, per-country compliance).

## Platform settlements and subscription

A dedicated **Billing** view in settings. At the top — a **large preview of the current commission**, with a breakdown:

- **base rate**: **7.5%** without a subscription, or **4.5%** with the **Pro** subscription, plus subscription status and renewal date,
- **referral discount**: **−1 pp** and the number of **remaining months** (see [Referrals](./20-referrals.md)),
- a possible **special platform rate** (super admin) and until when it applies,
- a button to enable/manage the **Pro (€11/mo)** subscription and what it unlocks.

The **Pro** subscription brings a lower commission (4.5%) and premium features — currently: **search Boost** (higher in results), **automatic Google Meet links**, and **advanced analytics** (forecasts, demand map, price comparison, trust score — see [Analytics](./30-analityka-i-statystyki.md)). A manual meeting link (Meet/Zoom/other) is always available for free.

Below: **invoices from the platform** to the provider (commission and subscription).

## Discount codes and promotions

A provider can run two kinds of discounts on their own services:

### Discount codes

A code entered by the client at checkout.

- Percentage or fixed amount
- Applies to selected services (or all)
- Optional usage limits (total count, per-client limit) and a validity window

### Timed promotions

An automatic discount on selected products for a set period — no code. Active within the window, then prices revert.

> The marketplace commission is calculated on the price **after the discount** — the provider and the platform share the cost of the discount proportionally.

---

⬅️ **Previous:** [Equipment Registry](./18-equipment.md) · **Next:** [Referrals](./20-referrals.md) ➡️
