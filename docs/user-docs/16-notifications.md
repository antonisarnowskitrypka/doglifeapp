# Powiadomienia

## Kanały

- **In-app** — centrum powiadomień wewnątrz platformy
- **Push** — przez Firebase Cloud Messaging (przeglądarka / PWA)
- **E-mail** — przez Resend

## Język

Powiadomienia są wysyłane w wybranym przez użytkownika **języku aplikacji**. Wspierane na starcie: **polski, bułgarski, angielski** (więcej w przyszłości).

## Preferencje

W ustawieniach każdy użytkownik może włączać/wyłączać kanały i regulować poszczególne ustawienia powiadomień.

## Powiadomienia usługodawcy

| Zdarzenie | Kanały |
|---|---|
| Nowa rezerwacja | In-app, push, e-mail |
| Rezerwacja REQUEST czeka na potwierdzenie (24h) | In-app, push, e-mail |
| Anulowanie przez klienta | In-app, push, e-mail |
| Nowa wiadomość na czacie profilu od klienta | In-app, push |
| Termin przeglądu / serwisu sprzętu | In-app |
| Klient udostępnił zdarzenie z życia zwierzaka | In-app |

## Powiadomienia klienta

| Zdarzenie | Kanały |
|---|---|
| Potwierdzenie rezerwacji | In-app, push, e-mail |
| Usługodawca zaproponował inny termin (REQUEST) | In-app, push, e-mail |
| Rezerwacja anulowana (brak potwierdzenia w 24h) + zwrot | In-app, push, e-mail |
| Zmiana terminu rezerwacji | In-app, push, e-mail |
| Prośba o podwyższenie ceny przez usługodawcę | In-app, push, e-mail |
| Przypomnienie o sesji | Push, e-mail |
| Przypomnienie o pracy domowej (cykliczne, włączane przez klienta, domyślnie off) | Push, in-app |
| Prośba o opinię (24h po usłudze) | E-mail |
| Certyfikat wystawiony (event/kurs) | In-app, push, e-mail |
| Nowość u obserwowanego usługodawcy (usługa/event/promocja) | In-app, push |
| Nowy event/usługodawca pasujący do obserwowanego wyszukiwania | In-app, push |

## Przypomnienia zdrowotne (moduł Życie zwierzaka)

Przypomnienia o szczepieniach i odrobaczaniu.

Domyślne terminy:
- Szczepienie: 2 tygodnie przed + 1 dzień przed
- Odrobaczanie: 1 tydzień przed + 1 dzień przed

Użytkownik może dostosować harmonogram przypomnień.

---

⬅️ **Poprzedni:** [Życie zwierzaka](./15-life-of-pet.md) · **Następny:** [Obserwowanie](./27-follows.md) ➡️
