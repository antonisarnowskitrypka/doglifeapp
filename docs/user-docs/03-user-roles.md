# Role użytkowników

## Klient

Właściciel zwierzaka.

Może:
- przeglądać marketplace
- rezerwować usługi
- zarządzać profilem i historią swojego zwierzęcia
- kupować pakiety treningowe
- komunikować się z usługodawcą w przestrzeni sesji

## Właściciel (Owner)

Osoba, która utworzyła organizację i nią zarządza (np. szkoła treningu zwierzaków).

Może:
- konfigurować profil organizacji i usługi
- dodawać pracowników i nimi zarządzać
- zarządzać swoim kalendarzem oraz kalendarzami pracowników
- obsługiwać płatności i onboarding Stripe Connect
- przeglądać wszystkie rezerwacje i historię klientów

> Właściciel jest jednocześnie pracownikiem — większość organizacji na platformie to firmy jednoosobowe.

## Pracownik (Staff)

Pracownik w ramach organizacji.

Może:
- prowadzić sesje
- pisać notatki i zalecenia z sesji
- zarządzać własnym kalendarzem i dostępnością
- obsługiwać klientów w przestrzeni sesji

---

## Zakres ról w MVP

MVP obejmuje: **Właściciela**, **Pracownika**, **Klienta**.

Brak rozbudowanego RBAC poza tymi trzema rolami w pierwszym wydaniu.

## Jedno konto, wiele ról

Role nie są przypisane na wyłączność do konta. Ta sama osoba może być **Właścicielem** własnej organizacji i jednocześnie **Pracownikiem** w innej — jest jeden login, a rola obowiązuje per organizacja. Zob. [Zakładanie konta](./02-accounts.md) — rejestracja, profil (awatar/bio) i proces zapraszania pracowników.

---

⬅️ **Poprzedni:** [Zakładanie konta](./02-accounts.md) · **Następny:** [Zwierzaki](./04-pets.md) ➡️
