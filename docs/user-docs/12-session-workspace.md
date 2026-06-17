# Przestrzeń sesji

Każda rezerwacja ma dedykowany ekran sesji, współdzielony przez klienta i usługodawcę. Jest to zakładka **REZERWACJA** ekranu [Szczegóły rezerwacji i historia](./13-booking-detail-and-history.md).

## Przed wizytą

Usługodawca może umieścić instrukcje dla klienta przed sesją (np. co zabrać, jak przygotować zwierzaka).

## Notatki usługodawcy

Usługodawca zapisuje dwa rodzaje treści, o różnej widoczności:

- **Notatki prywatne** — wewnętrzne obserwacje. **Zawsze prywatne dla usługodawcy**; klient nigdy ich nie widzi.
- **Zalecenia i przebieg** — **udostępniane klientowi**. To właśnie pojawia się w widoku klienta i we wspólnej historii.

Oba są **eksportowalne do PDF** (eksport usługodawcy zawiera notatki prywatne; eksport klienta nie).

## Notatki klienta

Prywatne notatki widoczne tylko dla klienta. Nieudostępniane usługodawcy.

## Praca domowa

Lista zadań, które usługodawca przydziela klientowi do wykonania między sesjami.

Klient może włączyć **cykliczne przypomnienie** o pracy domowej i wybrać co ile (np. codziennie, co 2 dni), żeby pamiętać o ćwiczeniu między sesjami. Domyślnie **wyłączone**.

Notatki, zalecenia i pracę domową można wstawiać z [szablonów](./26-templates.md). Część usług/kursów wypełnia sesję automatycznie — instrukcje i materiały pojawiają się od razu, a zalecenia i praca domowa czekają jako „oczekujące", dopóki usługodawca ich nie wyśle.

> W [kursie](./11-packages.md#struktura-kursu-dwa-poziomy) oprócz przestrzeni każdej lekcji jest też **przestrzeń całego kursu** — ze wspólnymi materiałami oraz prowadzonymi osobno notatkami i pracą domową na poziomie kursu.

## Załączniki

Pliki może dodać każda ze stron:
- Zdjęcia
- PDF-y

Każdy plik może mieć do 10 MB (obrazy i PDF).

Każdy załącznik obsługuje komentarze.

Gdy rezerwacja zostaje ukończona, jej [faktura](./19-provider-dashboard.md) jest generowana automatycznie i dodawana tutaj jako załącznik dla klienta.

> W obrębie rezerwacji nie ma osobnego czatu. Cała komunikacja w ramach rezerwacji odbywa się przez **komentarze** do załączników i zaleceń. Ogólne pytania przed rezerwacją idą przez [czat na profilu](./06-provider-profile.md).

## Sesje online

Dla sesji online w przestrzeni sesji pojawia się **link do spotkania** widoczny dla obu stron — automatyczny link Google Meet (gdy usługodawca podłączył Google) albo link wpisany ręcznie. Zob. [Integracja Google](./17-provider-setup.md).

## Metryki sesji

Sesja może zbierać dane liczbowe i tekstowe (np. prędkość na bieżni, siła, tętno) — pola pochodzą z [szablonu sesji](./26-templates.md) lub są dodane ad-hoc. Metryki są **widoczne dla klienta** i porównywane sesja-do-sesji w [historii](./13-booking-detail-and-history.md).

## Oś czasu

Wszystkie sesje w ramach relacji z usługodawcą (lub w całej platformie) budują skumulowaną historię postępów zwierzaka. Zob. też: [Życie zwierzaka](./15-life-of-pet.md).

---

⬅️ **Poprzedni:** [Pakiety i kursy](./11-packages.md) · **Następny:** [Szczegóły rezerwacji i historia](./13-booking-detail-and-history.md) ➡️
