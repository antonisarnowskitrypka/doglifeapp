# Banowanie klienta

Usługodawca może zbanować klienta, który zrobi coś niedopuszczalnego.

## Zakres

- Ban jest **per usługodawca (organizacja)** — blokuje klienta tylko u tego usługodawcy, nie na całej platformie.
- Dotyczy **klienta (właściciela)** i obejmuje wszystkie jego zwierzaki.

## Skutek

Gdy klient zostaje zbanowany:

- **Nowe rezerwacje są blokowane** — klient nie może już rezerwować żadnej usługi tego usługodawcy.
- **Przyszłe potwierdzone rezerwacje są anulowane** z **pełnym zwrotem**, według tych samych zasad co [anulacja przez usługodawcę](./10-booking-lifecycle.md) (bez kary dla klienta).
- Wcześniejsze/ukończone rezerwacje i ich historia pozostają nienaruszone.

## Uwagi

- Usługodawca może odnotować powód bana.
- Ban może zostać później zdjęty przez usługodawcę.
- Bany platformowe (nadużycia u wielu usługodawców) to sprawa super-admina, odrębna od tego bana na poziomie usługodawcy.

---

⬅️ **Poprzedni:** [Polecenia](./20-referrals.md) · **Następny:** [Szablony](./26-templates.md) ➡️
