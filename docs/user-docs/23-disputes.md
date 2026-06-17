# Spory (disputes)

Spór to niezgoda co do tego, czy zarezerwowana usługa została właściwie wykonana. Jest powiązany z konkretną rezerwacją.

## Kiedy można otworzyć

W **24-godzinnym oknie potwierdzenia** po czasie usługi (zob. [Cykl życia rezerwacji](./10-booking-lifecycle.md)).

- **Każda ze stron** — klient lub usługodawca — może otworzyć spór w tym oknie.
- Gdy okno minie bez sporu, rezerwacja zamyka się automatycznie, a płatność zostaje zwolniona — wtedy sporu nie da się już otworzyć w aplikacji.

## Co się dzieje

1. Strona otwiera spór z **powodem** i opcjonalnymi **dowodami** (załączniki).
2. Rezerwacja przechodzi w status **Disputed**, a płatność pozostaje **wstrzymana** (escrow nie jest zwalniany).
3. Operator platformy rozpatruje sprawę i rozstrzyga — **zwalnia** płatność usługodawcy lub **zwraca** klientowi (zob. [Super Admin](./24-super-admin.md)).

## Chargebacki

Chargeback karty zgłoszony przez bank klienta jest odrębny od sporu w aplikacji i obsługiwany przez operatora platformy niezależnie.

---

⬅️ **Poprzedni:** [Kontakt z pomocą](./22-contact-support.md) · **Następny:** [Super Admin](./24-super-admin.md) ➡️
