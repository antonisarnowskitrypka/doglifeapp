# Konfiguracja usługodawcy

## Organizacje

Każdy usługodawca należy do organizacji — nawet jednoosobowy trener jest własną organizacją. Ten model pozwala na przyszły rozwój (dodawanie pracowników) bez zmian strukturalnych.

Przykład: *Dog Academy Sofia* z pracownikami Ivan, Maria i Georgi.

## Kroki onboardingu

Nowo utworzone konto usługodawcy jest **ukryte** (`draft`) — nie pojawia się w wyszukiwarce, profil nie jest publiczny i nie przyjmuje rezerwacji. Na ekranie głównym widzisz **listę kontrolną** rzeczy do zrobienia:

1. Zarejestruj się i utwórz organizację
2. Podłącz konto Stripe (onboarding Stripe Connect)
3. Wybierz główne kategorie i dodaj usługi (tryb rezerwacji + tryby realizacji)
4. Dodaj lokacje (jeśli usługa jest „w lokacji")
5. Ustaw dostępność (tygodniowy harmonogram)

Gdy wszystkie wymagane elementy są gotowe, pojawia się duży przycisk **„Opublikuj"** — po kliknięciu profil staje się aktywny: widoczny w wyszukiwarce, publiczny i gotowy na rezerwacje (oraz indeksowany pod SEO).

## Główne kategorie usług

Platforma ma stałą listę **głównych kategorii**, każda z własnym **kolorem i ikoną** (widocznymi w wyszukiwarce, na usługach, w Życiu zwierzaka itd.):

| Główna kategoria | Przykłady |
|---|---|
| Trener / behawiorysta | Konsultacja trenerska, posłuszeństwo, doradztwo behawioralne |
| Trening sportowy | Agility, dogfrisbee, nosework, przygotowanie do wystawy |
| Fizjoterapia | Wizyta fizjo, masaż, Indiba, bieżnia wodna, plan treningowy |
| Grooming | Różne kategorie groomingu |
| Dietetyk | Konsultacja dietetyczna |
| Wynajem obiektu | Salka treningowa, teren zewnętrzny |
| Petsitting | Spacer, pobyt u klienta, hotel |
| Fotografia | Sesja zdjęciowa zwierzaka, sesja w plenerze, fotografia eventowa |

> **Event to nie osobna kategoria.** Wydarzenie grupowe (np. spacer grupowy, seminarium, webinar) ma **swoją normalną kategorię** jak każda usługa — np. spacer grupowy → Trening sportowy lub Trener, webinar dietetyczny → Dietetyk. „Powtarzalność" i „grupowość" to sposób prowadzenia (zob. [Wydarzenia powtarzalne](#wydarzenia-powtarzalne)), a nie kategoria.

- Usługodawca wybiera **listę głównych kategorii**, które świadczy (może być kilka).
- Każda usługa ma przypisaną **dokładnie jedną** główną kategorię.
- W menu usług usługodawcy usługi są **pogrupowane per kategoria**.

Usługodawca może też dodać własne, customowe typy usług w obrębie głównej kategorii.

## Wydarzenia powtarzalne

Wydarzenie (np. spacer grupowy, warsztat) może być **powtarzalne** — czyli serią z własną, indeksowaną podstroną, która zbiera kolejne wystąpienia. Są **dwa sposoby ustalania terminów**:

- **Z góry kilka terminów** — od razu dodajesz kilka dat (np. regularne spacery co piątek). Powstają konkretne wystąpienia.
- **Bez ustalonych terminów** — wiesz, że będziesz powtarzać, ale nie wiesz kiedy (spontanicznie, zależnie od pogody i ruchu). Terminy dodajesz później, pojedynczo.

> **Ważne:** każde wystąpienie jest **w pełni niezależne** — ma własną pojemność, zapisy, czat grupowy, przestrzeń sesji, opinie i certyfikat. Zmiana lub odwołanie jednego terminu nie rusza pozostałych. Wystąpienia dziedziczą domyślne ustawienia z serii (cena, pojemność, lokacja, szablon sesji), które możesz nadpisać per termin.

Klient na stronie serii zapisuje się na pojedynczy termin albo **zaznacza kilka naraz** i płaci łącznie (i tak powstają osobne rezerwacje). Może też **obserwować serię**, by dostać powiadomienie o nowym terminie — szczególnie przy wariancie bez ustalonych dat. Zob. [Obserwowanie](./27-follows.md).

## Przyjmowane gatunki

W ustawieniach usługodawca określa, jakie gatunki przyjmuje: **psy**, **koty** lub **oba**.

- Jeśli przyjmuje **oba gatunki**, może wybrać gatunek per usługa (np. jedne usługi tylko dla psów, inne tylko dla kotów, a jeszcze inne dla obu).
- Jeśli przyjmuje **tylko jeden gatunek**, wszystkie jego usługi są domyślnie dla tego gatunku.

Ustawienie to decyduje, komu usługi pokazują się w [wyszukiwaniu](./05-search.md).

## Tryb rezerwacji per usługa

Każdą usługę można ustawić na jeden z trzech trybów:
- **BOOK_NOW** (domyślny) — klient wybiera termin i od razu płaci, rezerwacja potwierdzona natychmiast
- **REQUEST** — klient wybiera termin i płaci, ale czekasz 24h na Twoje potwierdzenie: możesz zatwierdzić, zaproponować inny termin (jedna zmiana) lub anulować; brak reakcji w 24h = auto-anulacja i zwrot
- **INQUIRY** — klient składa zapytanie, Ty wyceniasz, klient płaci

Petsitting domyślnie działa w trybie INQUIRY. Szczegóły przepływów: [Cykl życia rezerwacji](./10-booking-lifecycle.md).

## Lokacje

Organizacja może mieć kilka lokacji (np. studio plus obiekt partnerski). Każda lokacja ma nazwę i adres. Usługi są powiązane z lokacją (lokacjami), w których są świadczone.

## Tryby realizacji per usługa

**Dla każdej usługi usługodawca sam wybiera, które tryby obsługuje** — nie każda usługa musi być online, nie każda z dojazdem do klienta. Usługa pojawia się w danym trybie wyszukiwania tylko, jeśli ten tryb jest dla niej włączony.

Każda usługa jest oferowana w jednym lub kilku trybach realizacji — to decyduje, jak pojawia się w [wyszukiwaniu](./05-search.md):

| Tryb | Konfiguracja |
|---|---|
| **W lokacji** | Powiąż usługę z jedną lub kilkoma swoimi lokacjami. |
| **U klienta w domu** | Włącz usługę dojazdową i ustaw **promień dojazdu** (w km od wybranej lokacji bazowej). Tylko klienci w tym promieniu znajdą usługę w wyszukiwaniu „Mój dom". |
| **Online** | Włącz per usługa. Przeznaczone dla konsultacji (trening, behawiorystyka, dietetyka). |

Usługa może łączyć tryby (np. konsultacja dostępna online i w lokacji).

**Każdy tryb ma własną cenę.** Dla jednej usługi możesz ustawić osobno cenę za realizację w lokacji, za dojazd do klienta i online. Wszystkie Twoje fizyczne lokacje dzielą tę samą cenę „w lokacji". Cena dojazdu jest na razie stała (dopłata za kilometry przyjdzie po MVP).

## Języki

Platforma jest międzynarodowa, więc język ma znaczenie przy odkrywaniu.

- **Każdy pracownik** zaznacza, jakimi językami się posługuje.
- Języki organizacji to **suma** języków wszystkich jej pracowników.
- W [wyszukiwaniu](./05-search.md) klienci mogą filtrować do usługodawców mówiących znanym im językiem — usługodawca pasuje, jeśli **którykolwiek** z jego pracowników mówi tym językiem.

## Pracownicy i usługi

Do każdej usługi przypisujesz **pracowników, którzy ją świadczą**. Przykład: szkoła oferuje *trening*, *behawiorystykę* i *nosework* — Eliza przyjmuje na *trening* i *behawiorystykę*, a Julka na *trening* i *nosework*. (W jednoosobowej firmie wszystko świadczy właściciel.)

- Wolne terminy usługi to **suma dostępności** przypisanych do niej pracowników.
- Przy rezerwacji klient może wybrać konkretnego pracownika albo zostawić **„dowolny dostępny"** — wtedy system przypisuje **najmniej obłożoną** wolną osobę w danym dniu (zob. [Rezerwacja usługi](./07-booking-a-service.md#wybór-pracownika)).
- Właściciel może **zmienić przypisanego pracownika** w rezerwacji — tylko na osobę świadczącą tę usługę. Jeśli wybrana osoba jest w tym czasie zajęta, zmiana jest możliwa, ale z **wyraźnym ostrzeżeniem o kolizji** w kalendarzu.

## Kalendarz i dostępność

### Godziny pracy firmy

W ustawieniach ustalasz **stałe godziny i dni pracy** firmy (np. 9–18, pon–sob). To **miękki domyślny** — wypełnia pusty kalendarz i domyślne godziny w kreatorze grafiku; w razie potrzeby możesz tworzyć terminy także poza nimi.

### Domyślny harmonogram tygodniowy

Grafik budujesz w **kreatorze** (zob. [Kreator dostępności](../ui-docs/01-availability-builder.md)): na siatce tygodnia dodajesz **bloki**, a w każdym wybierasz dni, godziny, **pracowników**, tryb (online / u klienta / w lokacji), lokację oraz **usługi** (kreator sam pomija te niewykonalne dla wybranych osób/lokacji) i tryb rezerwacji. Jeden blok rozkłada się na okna poszczególnych pracowników. Przed zapisem możesz kliknąć **„Sprawdź"** — aplikacja podpowie, czy każda Twoja usługa jest choć przez chwilę dostępna w grafiku i czy każdy pracownik ma choć jedną zmianę (sugestię można pominąć).

Możesz trzymać **do 3 nazwanych grafików** (np. *Standardowy*, *Wakacyjny*), z jednym **aktywnym**. Przełączenie aktywnego **nie zmienia już wygenerowanych tygodni** — decyduje tylko, z którego grafiku korzysta przyszła generacja terminów.

### Generowanie terminów

Terminy na kolejne tygodnie powstają z **aktywnego grafiku**:
- **Automatycznie** — wybierasz **dzień tygodnia** i **na ile tygodni w przód** (domyślnie 3); w ten dzień system dorzuca brakujące tygodnie (np. *w każdą niedzielę dodawaj terminy na 2 tygodnie do przodu*).
- **Ręcznie** — autogenerację wyłączasz i dodajesz kolejne tygodnie z palca, kiedy chcesz.

### Siatka godzin i bufor

- **Co ile można się zapisać** — ustawiasz, czy klient rezerwuje tylko o pełnych godzinach, co 30 minut, czy co 15 minut.
- **Czas operacyjny (bufor)** — po każdym spotkaniu możesz zarezerwować czas na odpoczynek/przygotowanie. Klient widzi czas trwania usługi, a system pilnuje, by kolejny termin zaczął się dopiero po buforze (np. usługa 50 min + 10 min dla Ciebie na wodę). Bufor ustawiasz per usługa (z domyślnym globalnym).

### Nieobecności (wyjątki)

Osobna ścieżka **„Dodaj nieobecność"** — nadpisuje kalendarz bez wchodzenia w konkretny dzień i okno. Wyszarza cały dzień lub jego część (np. urlop, wizyta u lekarza).

Jeśli w zablokowanym czasie są już potwierdzone rezerwacje, **nie** są one kasowane automatycznie — pokazują się do obsłużenia. Zostaną wyświetlone **bardzo wyraźnie** (do zaznaczenia przy projektowaniu UI), żebyś nigdy nie przeoczył umówionej wizyty.

### Uprawnienia pracownika do grafiku

W ustawieniach firmy właściciel steruje dwoma niezależnymi przełącznikami (domyślnie oba włączone):

- **Pracownik może edytować swój harmonogram** — gdy wyłączone, tygodniowy grafik pracownika ustawia tylko właściciel.
- **Autoakceptacja nieobecności** — gdy włączone, zgłoszona przez pracownika nieobecność obowiązuje od razu; gdy wyłączone, czeka na **zatwierdzenie właściciela** (do tego czasu **nie blokuje** terminów — wciąż można je zarezerwować). Nieobecności dodane przez właściciela obowiązują zawsze od razu.

### Szybkie akcje w planie dnia

Wchodząc w swój plan dnia i widząc „okienko" między klientami, możesz jednym dotknięciem:
- **Zablokować je jako przerwę** — nikt się tam nie zapisze (bez grzebania w zarządzaniu kalendarzem),
- **Podbić termin promocyjną ceną** — ten konkretny termin pojawia się publicznie z obniżoną ceną i plakietką promo, żeby szybko go sprzedać.

Każda organizacja ma **strefę czasową**; godziny i terminy są w niej interpretowane (DST automatycznie). Klienci widzą godziny w strefie usługodawcy.

## Pracownicy (STAFF)

W zakładce **STAFF** właściciel dodaje członków zespołu po **e-mailu**. Osoba otrzymuje zaproszenie i po jego akceptacji jej konto zostaje powiązane z organizacją jako pracownik. Jeśli nie ma jeszcze konta, zaproszenie pozostaje oczekujące do rejestracji. Zob. [Zakładanie konta](./02-accounts.md).

## Regulamin i RODO

Usługodawca może opublikować własny regulamin i politykę RODO/prywatności, które klienci akceptują przy rezerwacji — zob. [Regulamin i RODO usługodawcy](./08-terms-and-gdpr.md).

## Integracja z Google Calendar

W ustawieniach **każdy pracownik** może podłączyć własny kalendarz Google.

- **Synchronizacja jednostronna** (platforma → Google): rezerwacje oraz nieobecności/blokady trafiają do kalendarza Google pracownika.
- Zmiany **w Google nie wpływają** na platformę — edycja czy usunięcie wydarzenia w Google nie zmieni ani nie usunie rezerwacji. Działa to tylko w jedną stronę (platforma → Google).
- **Linki Google Meet** dla sesji online tworzą się automatycznie, gdy Google jest podłączony. Można też wpisać własny link (Meet/Zoom/inny), a w ustawieniach wyłączyć auto-generowanie linków.

## Logo i podpis (certyfikaty)

W ustawieniach możesz wgrać **logo** organizacji oraz **podpis w PNG**. Są używane na automatycznie generowanych [certyfikatach](./28-certificates.md) za eventy i kursy.

## Goście i rejestracja

Domyślnie klienci mogą rezerwować jako goście (bez konta). W ustawieniach możesz **wyłączyć obsługę gości** i wymusić rejestrację — wtedy rezerwacja u Ciebie wymaga konta.

## Rezerwacje ręczne

Usługodawca może dodawać rezerwacje ręcznie — przydatne dla klientów z ulicy lub z telefonu. Płatność gotówką/custom jest bez prowizji. Rezerwację dla **zarejestrowanego** klienta można też wysłać do opłacenia **Stripe'em** — wtedy obowiązuje standardowa prowizja (wg planu usługodawcy) i normalny escrow (zob. [Płatności](./09-payments-and-refunds.md)).

---

⬅️ **Poprzedni:** [Obserwowanie](./27-follows.md) · **Następny:** [Ewidencja sprzętu](./18-equipment.md) ➡️
