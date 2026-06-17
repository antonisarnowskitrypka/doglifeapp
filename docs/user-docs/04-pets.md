# Zwierzaki

Użytkownik może mieć kilka zwierzaków. Każdy zwierzak ma własny rekord, historię i oś czasu Życia zwierzaka.

## Rejestracja zwierzaka

Minimum potrzebne do rejestracji zwierzaka:

- Imię
- Gatunek (pies lub kot)
- Płeć (samiec lub samica)
- Data urodzenia
- Rasa

Każdy zwierzak ma **gatunek** — pies lub kot — wybierany przy rejestracji. Aplikacja na razie wspiera psy i koty.

Tyle wystarczy na start. Później właściciel może dodać więcej danych, np.:

- **Zdjęcie / awatar** zwierzaka
- Numer chipa
- Numer paszportu
- Status kastracji / sterylizacji
- Rodowód
- …oraz inne dokumenty (zob. [Życie zwierzaka](./15-life-of-pet.md))

## Wiele zwierzaków

- Właściciel może zarejestrować dowolną liczbę zwierzaków.
- W zakładce **Życie zwierzaka** właściciel wybiera, którego zwierzaka aktualnie ogląda.
- Dodając **własne zdarzenie w Życiu zwierzaka**, właściciel może dodać je do **kilku zwierzaków naraz** — np. wspólne szczepienie lub wspólna wizyta u weterynarza, z osobnymi wynikami dla każdego zwierzaka (wynik A dla zwierzaka A, wynik B dla zwierzaka B).
- Dla usług przyjmujących kilka zwierzaków (wydarzenia, spacery grupowe, niektóre konsultacje) właściciel może wybrać **kilka zwierzaków** w jednej rezerwacji.

## Pytania o zwierzaka (handling)

Rekord zwierzaka przechowuje odpowiedzi na standardowe pytania, których wielu usługodawców wymaga przed usługą, np.:

- Czy zwierzak jest agresywny?
- Stosunek do psów
- Stosunek do kotów
- Lęki / wyzwalacze

Pochodzą one z **katalogu zdefiniowanego przez platformę**. Usługodawca może oznaczyć część z nich jako **wymagane** dla swojej usługi — zob. [Rezerwacja usługi](./07-booking-a-service.md). Gdy właściciel odpowie na nie podczas rezerwacji, odpowiedzi zostają zapisane na **rekordzie zwierzaka** i są ponownie używane: każdemu kolejnemu usługodawcy, który wymaga tego samego pytania, odpowiedź podpowiada się automatycznie.

> Odpowiedzi handlingowe to funkcjonalne dane bezpieczeństwa zapisane na zwierzaku. W odróżnieniu od zdarzeń z osi czasu Życia zwierzaka (które właściciel udostępnia jawnie), są one automatycznie widoczne dla każdego usługodawcy, który ich wymaga.

## Choroby i przeciwwskazania

Rekord zwierzaka ma osobne, ważne pole na **choroby i przeciwwskazania** (np. nowotwór, zaawansowana dysplazja). To dane krytyczne dla bezpieczeństwa — są **zawsze pokazywane na wierzchu** usługodawcy przyjmującemu rezerwację (oraz w sesji), bez potrzeby ręcznego udostępniania. Właściciel wpisuje je swobodnym tekstem.

## Gdy zwierzak odchodzi lub jest usuwany

W **strefie zagrożenia (danger zone)** zwierzaka właściciel może:

- **„Odszedł za tęczowy most"** — oznaczyć zwierzaka jako zmarłego. Cała historia zostaje zachowana, ale nie można już rezerwować dla niego usług.
- **Usunąć** — całkowicie usunąć zwierzaka.

---

⬅️ **Poprzedni:** [Role użytkowników](./03-user-roles.md) · **Następny:** [Wyszukiwanie](./05-search.md) ➡️
