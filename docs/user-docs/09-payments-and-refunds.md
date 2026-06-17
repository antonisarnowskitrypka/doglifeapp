# Płatności i zwroty

## Metody płatności

| Metoda | Opis |
|---|---|
| Stripe | Domyślna dla rezerwacji przez platformę — płatność kartą online |
| Gotówka | Odnotowywana ręcznie przez usługodawcę |
| Custom | Inne ustalenie odnotowane przez usługodawcę |

W MVP nie zapisujemy danych kart — każda płatność idzie przez Stripe Checkout.

## Prowizja platformy

Platforma automatycznie pobiera prowizję od każdej transakcji przez Stripe Connect, liczoną od ceny po rabacie (po uwzględnieniu [kodu rabatowego lub promocji](./19-provider-dashboard.md)). Stawka zależy od planu usługodawcy:

- **bez abonamentu — 7,5%**,
- **z abonamentem Pro (11 €/mc) — 4,5%** plus funkcje premium,
- **aktywne polecenie** obniża stawkę o **dodatkowy 1 p.p.** (zob. [Polecenia](./20-referrals.md)).

Aktualną stawkę usługodawca widzi w panelu w sekcji **Rozliczenia** (zob. [Panel biznesowy](./19-provider-dashboard.md#rozliczenia-z-platformą-i-subskrypcja)).

## Przepływ płatności (rezerwacja przez platformę)

```
Klient → Stripe Checkout → Escrow → (po usłudze) → Usługodawca
```

Środki są przetrzymywane w escrow do czasu wykonania usługi, a następnie zwalniane usługodawcy.

## Checkout dla gościa

Klienci bez konta mogą zapłacić przez Stripe Checkout. Konto nie jest wymagane.

## Rezerwacje ręczne

Usługodawca może tworzyć rezerwacje ręcznie (dla istniejących lub nowych klientów) i samodzielnie odnotować dowolną metodę płatności (gotówka/custom) — wtedy **nie pobieramy prowizji**.

Rezerwację ręczną dla **zarejestrowanego** klienta można też wysłać do **opłacenia Stripe'em**. Wtedy działa jak zwykła płatność platformowa: obowiązuje standardowa prowizja (wg planu usługodawcy) i normalny escrow (środki trzymane do wykonania usługi).

## Zwroty

| Sytuacja | Zwrot |
|---|---|
| Klient anuluje w darmowym oknie | Pełny zwrot |
| Klient anuluje po darmowym oknie | Brak zwrotu |
| Usługodawca anuluje | Pełny zwrot dla klienta |
| Nieobecność (no show) | Brak zwrotu |

## Prośba o zwrot mimo polityki

Jeśli anulujesz **po darmowym oknie** albo doszło do **nieobecności** (czyli zwrot Ci nie przysługuje), możesz dołączyć **powód** i poprosić usługodawcę, żeby mimo wszystko zwrócił kwotę — np. w razie poważnej sytuacji rodzinnej. To dobra wola usługodawcy, nie reklamacja (spory dotyczą usług już wykonanych — zob. [Spory](./23-disputes.md)).

- **Anulacja i tak finalizuje się od razu** wg polityki (termin zwolniony, ewentualna sesja z pakietu zużyta) — prośba to osobny wątek, nie wstrzymuje niczego.
- Usługodawca może: zwrócić **całość** lub **część** kwoty, **przywrócić zużytą sesję** (w pakiecie/kursie), albo **odmówić**.
- Jeśli usługodawca nie odpowie w wyznaczonym czasie, prośba **wygasa** bez zwrotu.
- O złożeniu prośby i o decyzji obie strony dostają powiadomienie.

---

⬅️ **Poprzedni:** [Regulamin i RODO](./08-terms-and-gdpr.md) · **Następny:** [Cykl życia rezerwacji](./10-booking-lifecycle.md) ➡️
