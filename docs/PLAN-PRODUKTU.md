# DogLife — plan produktu i biznesu (skrót ustaleń)

> Jednostronicowy (duży) skrót wszystkich ustaleń: czym jest produkt, dla kogo, jak zarabia,
> jak działają kluczowe przepływy i co jest „na później". Szczegóły techniczne i pełne schematy
> danych są w `docs/dev-docs/`; tu jest tylko esencja + odrobina technikaliów.
> Stan na: czerwiec 2026 (MVP w budowie).

---

## 1. W jednym zdaniu

**DogLife** to marketplace + SaaS dla branży zwierzęcej (na start **psy i koty**): opiekun znajduje i rezerwuje
zaufanych specjalistów (trening, behawiorystyka, fizjoterapia, grooming, dietetyka, petsitting, wynajem obiektu,
fotografia), a specjalista dostaje komplet narzędzi do prowadzenia firmy — kalendarz, usługi, zespół, płatności,
rozliczenia, kursy/eventy, opinie i analitykę. Jedno konto, dwa światy: **opiekun** ↔ **firma**.

## 2. Problem i wartość

- **Opiekun**: rozproszona oferta (grupy FB, telefony, polecenia), brak jednego miejsca z dostępnością,
  cennikiem, opiniami i historią opieki nad zwierzakiem.
- **Specjalista**: prowadzi firmę „na kartce" — kalendarz w głowie, brak płatności online, faktur, analityki,
  trudność w obsłudze kursów/grup.
- **Rozwiązanie**: zaufany rynek (discovery → rezerwacja → realizacja → opinia) + lekki SaaS operacyjny dla
  usługodawcy, spięte płatnościami escrow i jednolitym profilem reputacji specjalisty.

## 3. Użytkownicy i role

| Rola (w aplikacji) | Kto to | Zakres |
|---|---|---|
| **Opiekun** | klient / właściciel zwierzaka | szukanie, rezerwacje, zwierzaki, Życie zwierzaka, opinie |
| **Właściciel (Owner)** | prowadzi firmę | pełne zarządzanie organizacją, zespołem, finansami, billingiem |
| **Pracownik (Staff)** | pracuje w firmie | własny kalendarz, własne rezerwacje/sesje, własne finanse (read-only), własny profil |
| **Guest leader** | zewnętrzny prowadzący | dostęp „jak staff" ale **tylko do jednego kursu/eventu**; własna reputacja |
| **Super-admin** | platforma | moderacja, konfiguracja, prowizje custom, spory, katalogi |
| **Gość (bez konta)** | niezalogowany | może zarezerwować i zapłacić (guest checkout); bez profilu/historii |

- **Jeden user = jedno konto**, ale może należeć do wielu firm (np. Owner własnej + Staff innej).
  Przełącznik kontekstu (Opiekun / poszczególne firmy) jest sercem nawigacji.
- **Reputacja przypięta do osoby** (`staffUserId`), nie do firmy — idzie za specjalistą między firmami.

## 4. Zakres usług

- **Kategorie (8, zarządzane centralnie):** trener/behawiorysta, sport/trening, fizjoterapia, grooming,
  dietetyk, wynajem obiektu, petsitting, fotografia. Każda ma swój kolor + ikonę w całej apce.
- **„Eventy to nie kategoria"** — event/kurs/pakiet zawsze należy do realnej kategorii.
- **Gatunki:** pies / kot (firma deklaruje obsługiwane; usługa dziedziczy domyślnie).
- **Poziom zaawansowania** (opcjonalny, 1–3) na usłudze i kursie — filtr wtórny.

## 5. Ścieżka rynku (happy path)

```
ODKRYCIE                 REZERWACJA                  REALIZACJA                 PO USŁUDZE
Szukaj (kategoria,   →   wybór usługi/trybu/      →  sesja + workspace      →  potwierdzenie (24h okno)
 lokalizacja, tagi)      pracownika/zwierzaka,        (notatki, zalecenia,      → wypłata z escrow
profil firmy             pytania handlingowe,         prace domowe, materiały)  → faktura
                         akceptacja regulaminu,                                 → prośba o opinię (24h)
                         płatność (escrow)
```

## 6. Model przychodowy (rozliczenia) — kanon

Prowizja marketplace pobierana automatycznie przez Stripe Connect od **kwoty po rabacie**.

| Sytuacja | Prowizja efektywna |
|---|---|
| Brak abonamentu (domyślnie) | **7,5%** |
| Abonament **Pro — 11 €/mc** | **4,5%** + funkcje premium |
| Aktywny rabat z polecenia | **−1 p.p.** od bazy (Pro → 3,5%; bez Pro → 6,5%) |
| Custom super-admina | wartość absolutna; **bonusy nie działają** |

- **Pro (11 €/mc)** odblokowuje: **Boost w wyszukiwarce**, **auto-linki Google Meet** (sesje online),
  **zaawansowaną analitykę** (predykcje, heatmapa popytu, benchmark cen, trust score).
- **Polecenie providera:** każde skuteczne polecenie = **+1 miesiąc** rabatu (miesiące się **sumują**,
  punkty procentowe **nie** — zawsze −1 p.p.); obie strony dostają +1 miesiąc. Licznik zamrożony, gdy
  działa custom-prowizja.
- **Polecenie klienta:** jednorazowy **voucher −5%** dla obu stron, **finansowany przez platformę**
  (wypłata providera bez zmian; 5% bierze na siebie platforma).
- **Rabaty providera** (kody / promocje czasowe / boost slotu): prowizja liczona od ceny po rabacie —
  provider i platforma dzielą koszt proporcjonalnie.

**Kolejność wyceny:** cena bazowa (wg trybu dostawy, ×liczba zwierząt jeśli „per pet") → promocja → kod rabatowy
→ `netPrice` → płatność → prowizja = `round(netPrice × rate)` → wypłata = `netPrice − prowizja`.

## 7. Rezerwacje

**Trzy tryby (per usługa):**

| Tryb | Przebieg | Domyślny dla |
|---|---|---|
| `book_now` | slot → płatność → potwierdzone od razu | większości |
| `request` | slot → płatność → 24h okno akceptacji providera (akceptuj / zaproponuj nowy czas / anuluj) | — |
| `inquiry` | zapytanie → wycena providera (z deadline) → płatność | petsitting |

- **Warunki przed rezerwacją:** firma opublikowana, brak bana, zwierzak aktywny, odpowiedzi na **pytania
  handlingowe** usługi, akceptacja **regulaminu + RODO** (wersjonowane), telefon jeśli wymagany.
- **Anulacje (okno bezpłatne wg polityki usługi):** `flexible` 24h / `standard` 48h / `strict` 72h przed startem.
  W oknie → pełny zwrot; poza oknem → `late_cancelled_consumed`, brak zwrotu.
- **Goodwill refund:** przy „brak zwrotu" (late-cancel / no-show) klient może dołączyć **powód** i prosić o zwrot
  z dobrej woli — **decyzja providera** (pełny/częściowy zwrot i/lub przywrócenie sesji z pakietu). Nie wstrzymuje
  slotu; rezerwacja finalizuje się normalnie.
- **Korekta ceny:** provider może podnieść cenę (zła usługa / niedopłata) — klient akceptuje (dopłata) lub
  anuluje bez kary. Działa też na `confirmed`, bo środki są w escrow.
- **Okno potwierdzenia 24h:** po usłudze obie strony potwierdzają (lub auto po 24h) → `completed` → zwolnienie
  escrow, faktura, prośba o opinię, dekrement pakietu. Spór wstrzymuje wypłatę (rozwiązywanie sporów — *parked*).

## 8. Kalendarz, dostępność, zespół

- **Godziny pracy** firmy = miękki default zasilający kreator dostępności.
- **Grafik:** szablon tygodniowy per pracownik, **do 3 presetów** (np. *Zwykły*, *Letni*), jeden aktywny.
  Generacja terminów: **auto** (Cloud Function, horyzont `weeksAhead`, domyślnie ~3) lub **manual**.
  Wygenerowane tygodnie są konkretne i edytowalne; zmiana presetu nie przepisuje wstecz.
- **Granulacja slotów:** 60 / 30 / 15 min. **Bufor operacyjny** po usłudze (sprzątanie/przerwa).
- **Typy harmonogramu usług:** `scheduled` (sloty), `fixed_event` (grupowy event z pojemnością),
  `stay` (petsitting — model na **obłożeniu**: max zwierząt/miejsc, naloty się nakładają do limitu).
- **Przypisanie pracownik↔usługa** (`service.staffIds`): sloty usługi = **suma** dostępności kwalifikowanych
  pracowników; przy „dowolny dostępny" system przydziela **najmniej obłożonego** (remis → losowo). Owner może
  zmienić przypisanego pracownika (przy kolizji — wyraźne ostrzeżenie).
- **Uprawnienia grafiku (2 przełączniki Ownera):** `staffCanEditOwnSchedule`, `staffAbsenceAutoAccept`
  (nieobecności od razu albo do akceptacji Ownera).
- **Nieobecności** = osobna ścieżka nadpisująca kalendarz (cały dzień / fragment, absence/break).
- **Szybkie akcje dnia:** „zablokuj jako przerwę", „**boost slotu**" (jednorazowy slot promocyjny w wyszukiwarce).
- **Google Calendar:** jednokierunkowa synchronizacja (platforma → Google).

## 9. Produkty: usługi, pakiety, kursy, eventy

- **Pakiet** — zwykły zestaw wymiennych sesji (np. *3 masaże*). Brak strony publicznej.
- **Kurs** — program z **własną stroną publiczną (SEO)**, **curriculum lekcji**, dwoma poziomami treści:
  - **materiały kursu** (wspólne dla wszystkich), **courseWorkspace** (notatki/zalecenia/prace domowe per uczestnik),
  - **lekcje** = pełne sesje z własnymi materiałami i metrykami; lekcje **odblokowują się po kolei**.
  - Osie niezależne: **pacing** (`individual`/`group`) × **daty** (`fixed`/`self_scheduled`). Ukończenie → **certyfikat**.
- **Eventy grupowe** (`fixed_event`): data, pojemność, **czat eventu** dla uczestników; zajmują prowadzącego.
- **Serie cykliczne** (`eventSeries`): własna strona publiczna; **każde wystąpienie to niezależny event**
  (własna pojemność, czat, sesja, opinie, certyfikat). Daty: `preset` (z góry) lub `open` (gdy jeszcze nie wiadomo —
  „obserwuj, by dostać powiadomienie").
- **Guest leader** — zewnętrzny prowadzący jednego kursu/eventu (dostęp jak staff, ale zafencowany; osobna reputacja).

## 10. Profile, opinie, zaufanie

- **Profil firmy** (Owner): nazwa, opis, **logo**, kategorie, gatunki, dane do faktury, lokalizacje, godziny.
- **Profil pracownika** (sam pracownik lub Owner): krótki/długi opis, **języki**, **avatar firmowy**
  (np. w koszulce zespołu — niezależny od osobistego avatara konta).
- **Profil opiekuna:** imię, bio, telefon, język, dane do faktury, avatar.
- **Opinie (klient → firma, po `completed`):** ocena 1–5, tagi (pula platformy), tekst publiczny,
  **prywatny feedback** (tylko dla providera). Każda opinia zasila **dwa agregaty**:
  - **firma** (jedyny, który wpływa na ranking) oraz **osoba** (reputacja specjalisty, ponad firmami).
  - **Loyalty review:** po **3** usługach u tego samego providera — jednorazowa opinia o **większej wadze**.
  - Guest leader oceniany osobno (nie wpływa na średnią firmy).
- **Trust score:** prywatny wskaźnik providera (ocena ważona, % potwierdzonych, completion, niezawodność,
  czas odpowiedzi) — **na razie niepubliczny i nie wpływa na ranking**.

## 11. Wyszukiwarka i ranking

- **Kategoria = kryterium główne**; autouzupełnianie tagów może przełączyć kategorię.
- **Geo:** H3 (precompute komórek pokrycia) + finalny haversine; 30 km dla `at_location`, promień własny dla `at_client`.
  Filtry: tryb dostawy, gatunek, tagi, język, opcjonalna data, opcjonalny poziom (pod „Więcej").
- **Ranking** (suma ważona w pamięci, wagi w configu): **trafność tagów** (nazwa > taksonomia) + **ocena firmy**
  (ważona, shrinkage dla nowych) + **bliskość** (0 dla online) + **Boost** (Pro) + **świeżość** (nowe obiekty,
  zanik ~30 dni, badge „Nowość"). Tylko firmy **opublikowane** (`active`).
- **MVP = tylko Firestore** (równość / array-contains; nazwy jako tokeny w tagach). Pełny full-text — *parked*.
- **SEO:** profile, usługi, kursy, eventy, serie mają własne, indeksowane strony; QR-y prowadzą do nich.

## 12. Komunikacja i powiadomienia

- **Czat profilowy** klient↔firma (jeden wątek na parę). **Brak czatu per rezerwacja** — komunikacja w sesji
  przez komentarze do materiałów/zaleceń.
- **Propozycja wizyty** w czacie: prefill do rezerwacji, **pre-approved** (pomija akceptację providera, ale nie
  pomija pytań handlingowych / regulaminu / płatności).
- **Czat eventu grupowego** dla uczestników (+ guest leader); routing 1:1 wpada do czatu profilowego.
- **Powiadomienia** (kanały + per-event preferencje): zmiany statusu rezerwacji, wiadomości, opinie,
  przypomnienia (m.in. opcjonalne **prace domowe**), nowe wystąpienia obserwowanych serii.

## 13. Zwierzak, Życie zwierzaka, obserwowanie

- **Zwierzaki** opiekuna: profil, status (aktywny/zmarły/usunięty), **pytania handlingowe** (agresja, stosunek
  do innych zwierząt itd.) zbierane przy rezerwacji.
- **Życie zwierzaka:** dokumenty, zdrowie, oś czasu; udostępnianie wydarzeń per provider.
- **Obserwowanie:** firm, zapisanych wyszukiwań, serii eventów.

## 14. Płatności i finanse

- **Stripe + Stripe Connect** (model marketplace), **escrow** do `completed` (auto-release po 24h bez sporu).
- **Typy płatności:** `stripe`, `cash`, `custom`. Rezerwacje manualne off-platform są **bez prowizji**;
  manualna dla zarejestrowanego klienta może iść przez Stripe (wtedy normalna prowizja + escrow).
- **Guest checkout** (bez konta; bez zapisu karty w MVP).
- **Waluta i VAT:** jedna waluta per firma; VAT-inclusive z adnotacją; kwoty w jednostkach minor (groszach).
- **Faktury** generowane automatycznie przy `completed` (MVP: „uproszczone"; pełne fiskalne — *parked*).
  Dane kupującego z `companyDetails`, jeśli klient prosi o fakturę na firmę.
- **QR** do stron publicznych (profil/kurs/event/seria) — druk/recepcja/social.
- **Billing platformy:** ekran „Rozliczenia" z dużym podglądem prowizji efektywnej (baza, rabat z polecenia,
  custom), CTA do Pro; faktury platforma→provider (commission / subscription).

## 15. Analityka i insighty

- **Pipeline zdarzeń** (server-authoritative, bez PII), rollup do agregatów; dashboardy czytają **tylko agregaty**.
- **Free (każdy):** wyświetlenia, kliknięcia, CTR, wejścia na profil, wolumen/przychód w czasie, % anulacji,
  % no-show, % powracających, top usługi, najczęstsze sloty, średni czas odpowiedzi, ocena ważona,
  teaser benchmarku cen (bez liczb). Historia **30 dni**.
- **Pro:** lejek konwersji, pełna **heatmapa popytu 7×24** + luki popyt-vs-dostępność, **predykcje
  deterministyczne** (bez AI/ML — średnie kroczące, regresja liniowa, indeks sezonowy), **pełny benchmark cen**
  (mediana, p25/p75, k-anonimowość ≥5 firm), **trust score**, breakdowny per ranga/tryb/kategoria/pracownik.
  Historia **90 dni**.
- **Zasada:** zero AI/ML; „estymata na bazie Twojej historii", z pasmem ufności wg liczby próbek.

## 16. Platforma i operacje

- **Super-admin:** moderacja, kolejki, `platformConfig` (wszystkie progi/wagi/stawki — bez hardkodów),
  prowizje custom, katalog kategorii i tagów, spory.
- **Regulamin + RODO** wersjonowane (klient akceptuje aktualną wersję przed rezerwacją).
- **Ban klienta** (Owner/Staff) — blokuje rezerwacje w danej firmie.
- **Wsparcie** (formularz + zgłoszenia) i **spory** (zgłoszenie + status) — spory/chargebacki *parked*.
- **Equipment registry** — rejestr sprzętu (serwis, koszty wpadają w wydatki), publiczne pozycje zasilają tagi.
- **Strona demo** — prowadzona prezentacja z symulowanymi zdarzeniami.

## 17. Technologia (skrót) i status

- **Stack:** Nuxt 4 + Nuxt UI v4 (kolory **teal / stone**, Tailwind), **Firebase** (Auth, Firestore, Storage,
  FCM, App Check) + **Admin SDK**, **Stripe Connect**, **Resend**, geo **H3**, dokumentacja API **OpenAPI** (Scalar `/_scalar`).
- **Zasada bezpieczeństwa:** **server-authoritative** — klient robi tylko `firebase/auth`; cały dostęp do danych
  i logika idą przez **server routes (Admin SDK)**; reguły Firestore = deny-all.
- **Środowiska:** **LOCAL** (Firebase Emulator Suite, projekt demo) → **DEV** (`doglife-dev`) → **PROD**
  (`doglife-prod`); te same nazwy zmiennych, różne wartości.
- **Auth:** e-mail/hasło + Google + Apple (Facebook usunięty; **weryfikacja SMS odroczona**).
- **i18n:** pl (główny rynek) + en + bg; region Europa (UK → Bułgaria).
- **Konwencje:** kwoty w jednostkach minor, 1 waluta/firma, czasy w UTC (bucketowane w strefie firmy), soft-delete.

**Co już działa (fundament zbudowany):** emulatory + SSR-auth, powłoka aplikacji z przełącznikiem kontekstu
(Opiekun ↔ firmy), modal logowania/rejestracji, kreator firmy (draft), zapraszanie i akceptacja pracownika
(role Owner/Staff, stany invited/pending/active), profile (opiekun/firma/pracownik) z uploadem avatarów i logo,
nawigacja per kontekst + breadcrumb, dokumentacja API. Reszta widoków = zaślepki wg planu UI.

## 18. Roadmapa po MVP

- **Aplikacje natywne iOS/Android** (Capacitor nad istniejącą apką).
- **Tap to Pay** (telefon jako terminal — płatności kartą na miejscu).
- **Cotygodniowe zadania trenera**, **osiągnięcia** (gamifikacja), **paszport podróżniczy zwierzaka**.
- **Owner premium** dla opiekunów (głównie funkcje zdrowotne), **kolejne perki Pro**, dodatkowe plany.
- **Referral cashback** (udział w prowizji od poleconego providera).
- **Full-text search** (Typesense/Meili/Algolia), **przypomnienia zdrowotne**, **integracje weterynaryjne**.
- **Spory & chargebacki**, **pełne faktury fiskalne**, **per-km surcharge** dla dojazdu.
- **GDPR erasure**, **antywirus uploadów**, **E2E testy**, **ML forecasting** (zamiast deterministycznych predykcji).

---

### Dokumenty źródłowe

Pełne specyfikacje: `docs/dev-docs/` (00–35). Dokumentacja użytkownika (PL + mirror EN): `docs/user-docs/` i
`docs/user-docs-EN/`. UI/interakcje: `docs/ui-docs/`. Ten plik to skrót — w razie rozbieżności **źródłem prawdy są
dev-docs**.
