# Super Admin

Panel sterowania operatora platformy. Odrębny od ról usługodawcy/klienta — zarządza samą platformą.

## Zarządzanie usługodawcami

- Przeglądanie wszystkich organizacji.
- Podgląd szczegółów i aktywności organizacji.
- **Zawieszanie / odblokowywanie** kont usługodawców.

## Spory i chargebacki

- Kolejka rezerwacji `disputed` i chargebacków Stripe.
- Rozpatrzenie każdej sprawy i rozstrzygnięcie — zwolnienie escrow usługodawcy lub zwrot klientowi.
- Rozstrzygnięcie sporu odblokowuje wstrzymaną płatność (zob. [Płatności](./09-payments-and-refunds.md)).

## Faktury platformy i prowizje

- Wystawianie i podgląd faktur platformy dla usługodawców.
- Konfiguracja **stawek prowizji** (bez abo 7,5% / Pro 4,5%), ceny abonamentu (11 €/mc) i wielkości zniżki za polecenie (1 p.p.).
- **Specjalna prowizja per usługodawca** — dowolna stawka absolutna na określony czas (np. testerzy: stałe 3% bez abo na rok). Nie dolicza się do niej żaden bonus, a miesiące zniżki za polecenia są na ten czas wstrzymane.
- **Ręczne włączenie abonamentu Pro** dla usługodawcy na dowolny czas (bez pobierania opłaty) — odblokowuje funkcje premium i stawkę 4,5%.

## Kolejka pomocy

Przychodzące [zgłoszenia pomocy](./22-contact-support.md) (pytania, problemy, błędy) są tu segregowane i obsługiwane.

## Moderacja i bany platformowe

- Moderacja opinii i treści użytkowników.
- Nakładanie **banów platformowych** (nadużycia obejmujące wielu usługodawców — w odróżnieniu od własnego [bana klienta](./21-client-ban.md) usługodawcy).
- Zarządzanie centralnymi katalogami: główne kategorie usług (z kolorem/ikoną), tagi usług, pytania handlingowe o zwierzaki, tagi wyróżnień w opiniach.

---

⬅️ **Poprzedni:** [Spory](./23-disputes.md) · **Następny:** [Strona demo](./25-demo.md) ➡️
