# Templates

A provider can create templates so they don't have to write the same thing every time. There are two kinds.

## Content templates

Ready-made blocks to insert manually in the [Session Workspace](./12-session-workspace.md):

- **Note template**
- **Recommendations template**
- (as well as homework, instructions, materials)

You can have several templates of each kind and pick the right one while filling out a session.

## Lesson / service templates

Assigned to a **service** or a **package/course** — they automatically prepare a session when a client books. Examples:

- the *Consultation* service always sends recommendations/instructions to prepare,
- the *Polite Waiting* course shares learning materials right away.

### When they fire

- **Service** — the content appears after the **booking is confirmed**.
- **Package/course** — right away **after purchase**.

### Session metric fields

In the session template settings you can define **fields for collecting data** — numeric or text — especially useful for physio (e.g. treadmill speed, strength, heart rate). Numeric fields can have a unit (km/h, bpm). You can also add an **ad-hoc** field right inside a session. The collected values are **visible to the client** and compared session-to-session (see [Booking Detail & History](./13-booking-detail-and-history.md)).

### What the client sees, and when

| Element | The client sees… |
|---|---|
| Pre-visit instructions | **right away** |
| Materials / attachments | **right away** |
| Recommendations | **only once the provider sends them manually** (they land as "pending", you have to click "send") |
| Homework | **only after manual sending** (likewise "pending" → sent) |

This way materials and instructions arrive automatically, while recommendations and homework can first be reviewed/adjusted by the provider and only then sent.

---

⬅️ **Previous:** [Banning a Client](./21-client-ban.md) · **Next:** [Certificates](./28-certificates.md) ➡️
