# DogLife — plan produktu i biznesu (skrót ustaleń)

> Skrót wszystkich ustaleń: czym jest produkt, dla kogo,
> jak działają kluczowe przepływy i co jest „na później".
> Stan na: czerwiec 2026 

---

## 1. W jednym zdaniu

**DogLife (Nazwa do ustalenia)** to marketplace + SaaS dla branży zwierzęcej (na start **psy i koty**): opiekun znajduje i rezerwuje
zaufanych specjalistów (trening, behawiorystyka, fizjoterapia, grooming, dietetyka, petsitting, wynajem obiektu,
fotografia), a specjalista dostaje komplet narzędzi do prowadzenia firmy — kalendarz, usługi, zespół, płatności,
rozliczenia, kursy/eventy, opinie i analitykę. Jedno konto, dwa światy: **opiekun** ↔ **firma**.

## 2. Aktualny rynek

- **Opiekun**: rozproszona oferta (grupy FB, telefony, polecenia), brak jednego miejsca z dostępnością,
  cennikiem, opiniami i historią opieki nad zwierzakiem.
- **Specjalista**: prowadzi firmę „na kartce" — kalendarz w głowie, brak płatności online, faktur, analityki,
  **trudność w obsłudze kursów/grup**. Lub używa aplikacji konkurencji, która nie ma wielu ważnych funkcji lub jest za droga
- **Rozwiązanie**: zaufany rynek (discovery → rezerwacja → realizacja → opinia) TYLKO dla usług zwierzęcych + lekki SaaS operacyjny dla
  usługodawcy, spięte płatnościami escrow i jednolitym profilem reputacji specjalisty.

## 3. Użytkownicy i role

| Rola (w aplikacji) | Kto to | Zakres |
|---|---|---|
| **Opiekun** | użytkownik końcowy / właściciel zwierzaka | szukanie, rezerwacje, zwierzaki, **Życie zwierzaka**, wystawianie opinii |
| **Właściciel (Owner)** | prowadzi firmę | pełne zarządzanie organizacją, zespołem, finansami, harmonogramem |
| **Pracownik (Staff)** | pracuje w firmie | własny kalendarz, własne rezerwacje/sesje, własne finanse (read-only), własne portfolio i opinie |
| **Guest leader** | zewnętrzny prowadzący | dostęp „jak staff" ale **tylko do jednego kursu/eventu**; własna reputacja, np. na "Seminarium z Julką" organizowanym przez HappyDog - Julka jest guest leaderem w kursie, ale ma 0 wglądu do HappyDog |
| **Super-admin** | platforma | moderacja, konfiguracja, prowizje custom, spory, katalogi |
| **Gość (bez konta)** | niezalogowany | może zarezerwować i zapłacić (guest checkout); bez profilu/historii. Po pierwszej rezerwacji mocna zachęta do założenia konta |

- **Jeden user = jedno konto**, ale może należeć do wielu firm (np. Owner własnej + Staff innej + opiekun własnych zwierząt).
  Przełącznik kontekstu (Opiekun / poszczególne firmy) jest sercem nawigacji - musi być łatwa i intuicyjna.
- **Reputacja przypięta do osoby** (`staffUserId`), nie do firmy — idzie za specjalistą między firmami.

## 4. Zakres usług

- **Kategorie (8, zarządzane centralnie):** trener/behawiorysta, sport/trening, fizjoterapia, grooming,
  dietetyk, wynajem obiektu, petsitting, fotografia. Każda ma swój kolor + ikonę w całej apce, jako powtarzalny pattern wpadający w pamięć. np. zawsze gdzie wystąpi kategoria "Sport", ma przy sobie swój **Chip**

<img width="718" height="494" alt="image" src="https://github.com/user-attachments/assets/402afdab-534d-4cbb-a86d-50e50094267f" />

- **Eventy** — wydarzenie o okreslonym terminie (jednorazowe lub powtarzalne), zazwyczaj grupowe
- **Pakiety** - pakiet na kilka usług danego provider'a, zazwyczaj w niższej cenie. Klient sam realizuje pakiet w swoim tempie
- **Kurs** - struktura zbliżona do pakietu, ale z dedykowanymi materiałami, certyfikatem, zazwyczaj grupowe. W jego skład również wchodzi X spotkań, którym provider może odgórnie zdefiniować daty lub użytkownik może je wybrać samodzielnie

  Każda usługa ma także przypisane:
- **Gatunki:** pies / kot (firma deklaruje obsługiwane; usługa dziedziczy).
- **Poziom zaawansowania** (opcjonalny, 1–3) na usłudze i kursie — filtr wtórny.

## 5. Ścieżka rynku (happy path)

```
ODKRYCIE                 REZERWACJA                  REALIZACJA                 PO USŁUDZE
Szukaj (kategoria,   →   wybór usługi/trybu/      →  sesja + workspace      →  potwierdzenie (24h okno)
lokalizacja, tagi)       pracownika/zwierzaka,       (notatki, zalecenia,      wypłata z escrow
explicit profil firmy    pytania handlingowe,        prace domowe, materiały)  faktura
                         akceptacja regulaminu,                                prośba o opinię (24h)
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
  **zaawansowaną analitykę** (predykcje, heatmapa popytu, benchmark cen, trust score), więcej do ustalenia.
- **Polecenie providera:** każde skuteczne polecenie (założenie konta i pierwsza zarezerwowana usługa przez Stripe) = **+1 miesiąc** rabatu (miesiące się **sumują**, punkty procentowe **nie** — zawsze −1 p.p.); obie strony dostają +1 miesiąc. Licznik zamrożony, gdy działa custom-prowizja.
- **Polecenie klienta:** jednorazowy **voucher −5%** dla obu stron, **finansowany przez platformę**
  (wypłata providera bez zmian; 5% bierze na siebie platforma) - tylko na platnosci online.
- **Rabaty providera** (kody / promocje czasowe / boost slotu): prowizja liczona od ceny po rabacie

**Kolejność wyceny:** cena bazowa (wg trybu dostawy, ×liczba zwierząt jeśli „per pet") → promocja / kod rabatowy
→ `netPrice` → płatność → prowizja = `round(netPrice × rate)` → wypłata = `netPrice − prowizja`.

## 7. Rezerwacje

**Trzy tryby (per usługa):**

| Tryb | Przebieg | Domyślny dla |
|---|---|---|
| `book_now` | slot → płatność → potwierdzone od razu | większości |
| `request` | slot → płatność → 24h okno akceptacji providera (akceptuj / zaproponuj nowy czas / anuluj) | — |
| `inquiry` | zapytanie → wycena providera (z deadline) → płatność | petsitting |

- **Warunki przed rezerwacją:** firma opublikowana, brak bana, zwierzak aktywny, odpowiedzi na **pytania
  handlingowe** usługi, akceptacja **regulaminu + RODO**, telefon jeśli wymagany.
- **Anulacje (okno bezpłatne wg polityki usługi):** `flexible` 24h / `standard` 48h / `strict` 72h przed startem.
  W oknie → pełny zwrot; poza oknem → `late_cancelled_consumed`, brak zwrotu.
- **Goodwill refund:** przy „brak zwrotu" (late-cancel / no-show) klient może dołączyć **powód** i prosić o zwrot
  z dobrej woli — **decyzja providera** (pełny/częściowy zwrot i/lub przywrócenie sesji z pakietu).
- **Korekta ceny:** provider może podnieść cenę (zła usługa / niedopłata) — klient akceptuje (dopłata) lub
  anuluje bez kary. Działa też na `confirmed`, bo środki są w escrow.
- **Okno potwierdzenia 24h:** po usłudze obie strony potwierdzają (lub auto po 24h) → `completed` → zwolnienie
  escrow, faktura, prośba o opinię, dekrement pakietu. Spór wstrzymuje wypłatę (rozwiązywanie sporów — *parked*).

## 8. Kalendarz, dostępność, zespół

- **Godziny i dni pracy** firmy = miękki default zasilający kreator dostępności.
- **Grafik:** szablon tygodniowy per pracownik, **z definiowanymi presetami** (np. *Zwykły*, *Letni*), jeden aktywny.
  Generacja terminów: **auto** lub **manual**. Provider w swoim menu głównym widzi jasno, na jak długo do przodu ma terminy i może łatwo to kliknąć. Wygenerowane tygodnie są konkretne i edytowalne; zmiana presetu nie przepisuje wstecz.
- **Granulacja slotów:** 60 / 30 / 15 min - ustawiane per firma. **Bufor operacyjny** po usłudze (sprzątanie/przerwa) - ustawiane per usługa
- **Typy harmonogramu usług:** `scheduled` (sloty), `fixed_event` (grupowy event z pojemnością),
  `stay` (petsitting — model na **obłożeniu**: max zwierząt/miejsc, naloty się nakładają do limitu).
- **Przypisanie pracownik↔usługa** (`service.staffIds`): Klient moze zapisac sie tylko do pracownika, ktory dana usluge oferuje. Sloty usługi = **suma** dostępności kwalifikowanych pracowników; przy „dowolny dostępny" system przydziela **najmniej obłożonego** (remis → losowo). Owner może zmienić przypisanego pracownika (przy kolizji — wyraźne ostrzeżenie).
- **Uprawnienia grafiku (2 przełączniki Ownera):** `staffCanEditOwnSchedule`, `staffAbsenceAutoAccept`
  (nieobecności od razu albo do akceptacji Ownera).
- **Nieobecności** = osobna ścieżka nadpisująca kalendarz (cały dzień / fragment, absence/break) - kazdy pracownik latwo zglasza nieobecnosci, ktore maja wyzszy priorytet od harmonogramu usług.
- **Szybkie akcje dnia:** Gdy firma ma okienko, mamy szybkie akcje: „zablokuj jako przerwę", „**boost slotu**" (jednorazowy slot promocyjny w wyszukiwarce).
- **Google Calendar:** jednokierunkowa synchronizacja (platforma → Google).

## 9. Więcej o produktach: usługi, pakiety, kursy, eventy

- **Pakiet** — zwykły zestaw wymiennych sesji (np. *3 masaże*). Brak strony publicznej.
- **Kurs** — program z **własną stroną publiczną (SEO)**, **curriculum lekcji**, dwoma poziomami treści:
  - **materiały kursu** (wspólne dla wszystkich), **courseWorkspace** (notatki/zalecenia/prace domowe per uczestnik),
  - **lekcje** = pełne sesje z własnymi materiałami i własnymi metrykami; lekcje **odblokowują się po kolei**.
  - Osie niezależne: **pacing** (`individual`/`group`) × **daty** (`fixed`/`self_scheduled`). Ukończenie → **certyfikat**.
- **Eventy grupowe** (`fixed_event`): data, pojemność, **czat eventu** dla uczestników; zajmują prowadzącego.
- **Serie cykliczne** (`eventSeries`): własna strona publiczna; **każde wystąpienie to niezależny event**
  (własna pojemność, czat, sesja, opinie, certyfikat). Daty: `preset` (z góry) lub `open` (gdy jeszcze nie wiadomo —
  „obserwuj, by dostać powiadomienie").
- **Guest leader** — zewnętrzny prowadzący jednego kursu/eventu (dostęp jak staff, ale zafencowany; osobna reputacja).

## 10. Profile, opinie, zaufanie

- **Profil firmy** (Owner): nazwa, opis, **logo**, kategorie, gatunki, dane do faktur, lokalizacje, godziny.
- **Profil pracownika** (sam pracownik lub Owner): krótki/długi opis, **języki**, **avatar firmowy**
  (np. w koszulce zespołu — niezależny od osobistego avatara konta z opiekuna, ale domyślnie ten sam).
- **Profil opiekuna:** imię, bio, telefon, język, dane do faktury, avatar.
- **Opinie (klient → firma, po `completed`):** ocena 1–5, tagi (pula platformy), tekst publiczny,
  **prywatny feedback** (tylko dla providera). Każda opinia zasila **dwa agregaty**:
  - **firma** (jedyny, który wpływa na ranking) oraz **osoba** (reputacja specjalisty, ponad firmami).
  - **Loyalty review:** po **3** usługach u tego samego providera — jednorazowa opinia o **większej wadze**.
  - Guest leader oceniany osobno (nie wpływa na średnią firmy).
- **Trust score:** prywatny wskaźnik providera (ocena ważona, % potwierdzonych, completion, niezawodność,
  czas odpowiedzi) — **na razie niepubliczny i nie wpływa na ranking**, do zastosowania w przyszłości i w statystykach providera.

  ## 11. Wyszukiwarka i ranking

- **Kategoria = kryterium główne**; autouzupełnianie tagów może przełączyć kategorię.
- **Geo:** H3 ; 30 km dla `at_location`, promień własny dla `at_client`.
  Filtry: tryb usługi (online, `at_location`, `at_client`), gatunek, tagi, język, opcjonalna data, opcjonalny poziom (pod „Więcej").
- **Ranking** (niejawny! Brak możliwości sortowania): **trafność tagów** (nazwa >> taksonomia) + **ocena firmy**
  (ważona) + **bliskość** (0 dla online) + **Boost** (Pro) + **świeżość** (nowe obiekty, zanik ~30 dni, badge „Nowość"). Tylko firmy **opublikowane** (`active`).
- **MVP = tylko Firestore**: narazie brak obsługi szukania po treściach głębokich, handlingu literówek itd. Duży aspekt.
- **SEO:** profile, usługi, kursy, eventy, serie mają własne, indeksowane strony; QR-y prowadzą do nich.

  ## 12. Komunikacja i powiadomienia

- **Czat profilowy** klient↔firma (jeden wątek na parę). **Brak czatu per rezerwacja** — komunikacja w sesji
  przez komentarze do materiałów/zaleceń/filmików.
- **Propozycja wizyty** w czacie: Provider może wysłać po rozmowie prefill do rezerwacji, **pre-approved** (pomija akceptację providera, ale nie pomija pytań handlingowych / regulaminu / płatności).
- **Czat eventu grupowego** dla uczestników (+ guest leader); 1:1 wpada do czatu profilowego.
- **Powiadomienia** (kanały + per-event preferencje): zmiany statusu rezerwacji, wiadomości, opinie, przypomnienia (m.in. opcjonalne **prace domowe**), nowe wystąpienia obserwowanych serii.

## 13. Zwierzak, Życie zwierzaka, obserwowanie

- **Zwierzaki** opiekuna: profil, status (aktywny/"za ręczowym mostem"/usunięty), **pytania handlingowe** (agresja, stosunek
  do innych zwierząt itd.) zbierane przy rezerwacji.
- **Życie zwierzaka:** wizyty, wyniki badań, dokumenty, zdrowie, oś czasu; możliwe udostępnianie wydarzeń per provider.
- **Obserwowanie:** firm, zapisanych wyszukiwań, serii eventów.

## 14. Technologia (skrót) i status

- **Stack:** Nuxt 4 + Nuxt UI v4 (kolory **teal / stone**, Tailwind), **Firebase** (Auth, Firestore, Storage,
  FCM, App Check) + **Admin SDK**, **Stripe Connect**, **Resend**, geo **H3**, dokumentacja API **OpenAPI** (Scalar `/_scalar`).
- **Zasada bezpieczeństwa:** **server-authoritative** — klient robi tylko `firebase/auth`; cały dostęp do danych
  i logika idą przez **server routes (Admin SDK)**; reguły Firestore = deny-all.
- **Środowiska:** **LOCAL** (Firebase Emulator Suite, projekt demo) → **DEV** (`doglife-dev`) → **PROD**
  (`doglife-prod`); te same nazwy zmiennych, różne wartości.
- **Auth:** e-mail/hasło + Google + Apple
- **i18n:** pl (główny rynek) + en + bg; region Europa (strefy czasowe: UK → Bułgaria).
- **Konwencje:** 1 waluta/firma, czasy w UTC (bucketowane w strefie firmy), soft-delete.
