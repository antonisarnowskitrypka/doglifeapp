# Cykl życia rezerwacji

## Statusy

| Status | Opis |
|---|---|
| `Draft` | Rezerwacja rozpoczęta, ale niewysłana |
| `Pending` | Wysłana, oczekuje na działanie usługodawcy |
| `Quoted` | Usługodawca wysłał wycenę (tryb INQUIRY) |
| `Price Adjustment Requested` | Usługodawca poprosił o wyższą cenę; czeka na decyzję klienta |
| `Awaiting Payment` | Wycena zaakceptowana, oczekuje na płatność |
| `Awaiting Provider Confirmation` | Tryb REQUEST: opłacone, czeka na potwierdzenie usługodawcy (24h) |
| `Reschedule Proposed` | Tryb REQUEST: usługodawca zaproponował inny termin; czeka na decyzję klienta |
| `Confirmed` | Płatność otrzymana, rezerwacja aktywna |
| `Awaiting Confirmation` | Minął czas usługi; 24h na potwierdzenie lub zakwestionowanie przez obie strony |
| `Completed` | Usługa potwierdzona; płatność zwolniona usługodawcy |
| `Disputed` | Jedna ze stron zakwestionowała w oknie potwierdzenia |
| `Cancelled` | Anulowana przez klienta lub usługodawcę |
| `Late Cancelled Consumed` | Anulowana po darmowym oknie — sesja przepada z pakietu |
| `No Show` | Klient się nie pojawił |

## Tryby rezerwacji

Tryb ustawia usługodawca per usługa (zob. [Konfiguracja usługodawcy](./17-provider-setup.md)):

- **BOOK_NOW** — wybór terminu → płatność → od razu `Confirmed`.
- **REQUEST** — wybór terminu → płatność → `Awaiting Provider Confirmation` (24h). Usługodawca zatwierdza (`Confirmed`), proponuje inny termin (`Reschedule Proposed`) albo anuluje (pełny zwrot). Brak reakcji w 24h → automatyczna anulacja + pełny zwrot.
- **INQUIRY** — zapytanie → `Quoted` (wycena z terminem) → płatność → `Confirmed`.

### Tryb REQUEST — propozycja innego terminu

Gdy usługodawca zaproponuje inny termin, rezerwacja wraca do klienta (`Reschedule Proposed`):

- Klient **akceptuje** → `Confirmed` (nowy termin).
- Klient **odrzuca** → anulacja + pełny zwrot.

Możliwa jest **tylko jedna** taka zmiana — żeby nie odbijać rezerwacji w nieskończoność. Dalsze ustalenia toczą się na czacie, nie przez kolejne propozycje terminu.

## Edycja rezerwacji przez usługodawcę

Po otrzymaniu rezerwacji usługodawca może nią zarządzać:

- **Przełożyć** — przenieść rezerwację na inny termin. Klient zostaje powiadomiony.
- **Anulować** — anulować rezerwację (pełny zwrot, odnotowane w historii usługodawcy — zob. niżej).
- **Poprosić o podwyższenie ceny** — zob. niżej.

### Prośba o podwyższenie ceny

Jeśli klient wybrał złą usługę/produkt (przez pomyłkę lub by zapłacić mniej), usługodawca może poprosić o wyższą cenę zamiast anulować.

Przebieg:
1. Usługodawca podaje nową cenę z krótkim uzasadnieniem
2. Klient zostaje powiadomiony i przegląda skorygowaną cenę
3. Klient **akceptuje** → różnica jest doliczana → rezerwacja trwa dalej
4. Klient **odrzuca** → rezerwację można anulować bez kary (pełny zwrot pierwotnej kwoty)

Jest to dostępne zarówno **przed** potwierdzeniem (etap zapytania/wyceny), jak i na już **potwierdzonej** rezerwacji — płatność jest trzymana w escrow do wykonania usługi, więc kwotę można skorygować do tego momentu.

## Potwierdzenie wykonanej usługi

Po upływie czasu usługi jest **24-godzinne okno**, w którym zarówno klient, jak i usługodawca mogą potwierdzić, że usługa się odbyła — albo ją zakwestionować.

- Jeśli **obie strony potwierdzą**, rezerwacja od razu się zamyka.
- Jeśli **nikt nie zakwestionuje** w ciągu 24h, zamyka się automatycznie, a płatność zostaje zwolniona usługodawcy.
- Jeśli **którakolwiek strona zakwestionuje**, płatność jest wstrzymana, a sprawa trafia do rozstrzygnięcia.

## Przełożenie przez klienta

Klient może poprosić o przeniesienie rezerwacji, zgodnie z tymi samymi oknami polityki zwrotów:

- **W darmowym oknie** — traktowane jak zwykła zmiana. Jeśli usługa jest w trybie BOOK_NOW, dzieje się automatycznie; w innych trybach usługodawca zatwierdza nowy termin.
- **W oknie płatnym** (po darmowym oknie) — **decyzja należy do usługodawcy**, czy zgodzić się na przełożenie.

## Anulowanie przez klienta

Usługodawca ustala politykę anulacji dla każdej usługi:

| Polityka | Darmowe okno anulacji |
|---|---|
| Flexible | Do 24 godzin przed |
| Standard | Do 48 godzin przed |
| Strict | Do 72 godzin przed |

Anulacja w darmowym oknie oznacza pełny zwrot.
Anulacja po terminie oznacza brak zwrotu. Jeśli rezerwacja była częścią pakietu, sesja przepada.

## Anulowanie przez usługodawcę

- Pełny zwrot dla klienta.
- Brak kary dla klienta.
- Anulacja jest odnotowana w historii usługodawcy.

## Nieobecność (No Show)

- Brak zwrotu.
- Jeśli część pakietu: sesja przepada (`remaining sessions--`).

---

⬅️ **Poprzedni:** [Płatności i zwroty](./09-payments-and-refunds.md) · **Następny:** [Pakiety i kursy](./11-packages.md) ➡️
