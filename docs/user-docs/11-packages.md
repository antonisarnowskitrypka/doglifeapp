# Pakiety i kursy

Są dwa rodzaje produktów oparte na tej samej mechanice zużywania sesji:

- **Pakiet** — prosty zestaw wymiennych sesji (np. *3 masaże*). Sprzedawany z profilu, bez osobnej podstrony.
- **Kurs** — uporządkowany program (np. *Grzeczne Czekanie*) z **własną, indeksowaną podstroną**, **programem lekcji** i konfigurowalnym tempem. Zob. niżej.

## Kurs

- Ma **własną podstronę** (indeksowaną w wyszukiwarkach) z opisem.
- Ma **program lekcji** — nazwane, kolejne lekcje; każda lekcja może mieć swój [szablon sesji](./26-templates.md) (materiały, metryki).
- **Tempo** (kto uczestniczy): **indywidualny** albo **grupowy**.
- **Tryb dat** (jak ustalane są terminy):
  - **z góry ustalone** — wszystkie daty kursu znane z góry (np. *Psie Przedszkole Wiosna 2026*), zapisujesz się na całą serię,
  - **własna selekcja** — sam umawiasz kolejne sesje z kalendarza we własnym tempie.
- Tempo i tryb dat to **dwie niezależne opcje** — usługodawca wybiera obie. Zwykle: grupowy → daty z góry, indywidualny → własna selekcja, ale dozwolone są wszystkie kombinacje.
- Może mieć opcjonalny **poziom zaawansowania** (1–3, od początkującego po zaawansowany) — pokazywany na karcie i filtrowany w [wyszukiwarce](./05-search.md#poziom-zaawansowania).
- Po ukończeniu kursu dostajesz [certyfikat](./28-certificates.md).

### Struktura kursu (dwa poziomy)

Kurs ma treści na **dwóch poziomach** — wspólny „parasol" kursu i poszczególne lekcje:

```
Kurs „Grzeczne Czekanie"
├── Materiały kursu (wspólne)      wprowadzenie, plan, filmik wprowadzający
├── Notatki i praca domowa kursu   (prowadzone osobno dla każdego uczestnika)
└── Lekcje (każda to pełna sesja, z własnymi materiałami)
    ├── Lekcja 1 „Legowisko"       własne materiały, metryki, notatki…
    ├── Lekcja 2 …
    └── …
```

- **Materiały kursu** (wprowadzenie, plan, filmik) są **wspólne** dla wszystkich zapisanych i widoczne **od razu po zapisie**.
- **Notatki i praca domowa kursu** prowadzone są **osobno dla każdego uczestnika** (i jego zwierzaka) — także w kursie grupowym. Zalecenia i praca domowa pojawiają się u klienta dopiero, gdy usługodawca je wyśle; notatki prywatne zostają u usługodawcy.
- Każda **lekcja** to pełna [sesja](./12-session-workspace.md) z własnymi materiałami.
- **Lekcje odblokowują się po kolei**: w trybie „z góry ustalone" — wg daty lekcji; w trybie „własna selekcja" — po ukończeniu poprzedniej.

### Gościnny prowadzący

Na kurs lub wydarzenie usługodawca może zaprosić **gościnnego prowadzącego** — np. innego trenera spoza firmy. Taka osoba:

- **nie staje się** pracownikiem firmy — ma dostęp tylko do **tego jednego** wydarzenia,
- może uczestniczyć w dyskusji grupowej, dodawać komentarze i wrzucać materiały, tak jak prowadzący z firmy,
- jest pokazana na stronie kursu/wydarzenia jako współprowadzący,
- po wydarzeniu można ją **ocenić osobno** — ta opinia trafia do reputacji samego prowadzącego, nie do średniej firmy (zob. [Opinie](./14-reviews.md)).

Zaproszenie można w każdej chwili cofnąć — dostęp do wydarzenia wtedy znika.

## Przykład (pakiet)

> **3 masaże** — 3 sesje — 150 EUR

## Jak to działa

1. Klient kupuje pakiet z profilu usługodawcy
2. Płatność przechodzi przez Stripe Checkout (cała kwota z góry)
3. Każda rezerwacja w ramach pakietu zmniejsza liczbę pozostałych sesji
4. Przestrzeń sesji pokazuje numer sesji w pakiecie

## Zasady zużycia sesji

| Sytuacja | Skutek |
|---|---|
| Wczesna anulacja (w darmowym oknie) | Sesja wraca do puli |
| Późna anulacja (po darmowym oknie) | Sesja przepada — `remaining--` |
| Nieobecność (no show) | Sesja przepada — `remaining--` |
| Ukończona sesja | Sesja przepada — `remaining--` |

## Certyfikat

Po ukończeniu **kursu** klient automatycznie otrzymuje [certyfikat PDF](./28-certificates.md). Zwykłe pakiety nie mają certyfikatu domyślnie.

## Stan pakietu

Każdy wykupiony pakiet śledzi:
- `totalSessions` — pierwotna liczba kupionych sesji
- `remainingSessions` — sesje wciąż dostępne do wykorzystania

---

⬅️ **Poprzedni:** [Cykl życia rezerwacji](./10-booking-lifecycle.md) · **Następny:** [Przestrzeń sesji](./12-session-workspace.md) ➡️
