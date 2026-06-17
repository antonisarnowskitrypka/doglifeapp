# Panel biznesowy usługodawcy

Poza rezerwacjami i kalendarzem usługodawca ma panel biznesowy obejmujący finanse, fakturowanie, rozliczenia z platformą i promocje.

## Podsumowanie finansowe

Zestawienie zarobków i wydatków w wybranym okresie (np. miesiąc, kwartał, zakres niestandardowy).

- **Zarobki** — wyprowadzone z rezerwacji/płatności (platforma + ręczne).
- **Wydatki** — dwa źródła:
  - Wpisy ręczne dodawane przez usługodawcę (czynsz, materiały itd.)
  - Koszty serwisowania sprzętu zaciągane automatycznie z [Ewidencji sprzętu](./18-equipment.md)
- **Per trener** — dla organizacji z kilkoma pracownikami zarobki i wydatki można rozbić per trener (na podstawie tego, kto prowadził daną rezerwację). Usługodawcy jednoosobowi widzą po prostu własne sumy.

## Kody QR

Możesz wyeksportować kody QR do druku (na recepcję) lub udostępnienia w social mediach:

- **QR firmy** — prowadzi do Twojego profilu,
- **QR kursu** — do podstrony kursu,
- **QR wydarzenia** — do podstrony eventu.

Każdy QR prowadzi do publicznej, indeksowanej strony danego elementu; eksport w formacie gotowym do druku.

## Statystyki i wgląd

Pełna analityka ma własny ekran — zob. [Analityka i statystyki](./30-analityka-i-statystyki.md). W skrócie:

- **Za darmo (do 30 dni):** wyświetlenia i kliknięcia (CTR), rezerwacje i przychód w czasie, anulacje/no-show, **stali klienci**, **top usługi**, najczęściej rezerwowane godziny, średni czas odpowiedzi, średnia ocena.
- **W Pro (do 90 dni):** lejek konwersji, prognozy (bez AI), mapa popytu i podpowiedzi „duży popyt, brak terminów", pełne porównanie cen z rynkiem, wskaźnik zaufania, rozbicia per trener.

## Faktury dla klienta

Platforma może **automatycznie wygenerować fakturę** za usługę, bo posiada już dane zarówno usługodawcy, jak i klienta.

- Generowana **automatycznie, gdy rezerwacja osiąga status `Completed`** — bez ręcznego kroku.
- Generowana z danych rezerwacji — bez ponownego wpisywania.
- Wystawiana jako czytelny dokument PDF z danymi obu stron i pozycjami.
- Dostarczana klientowi od razu jako **załącznik w [Przestrzeni sesji](./12-session-workspace.md)**.
- **MVP:** uproszczone dokumenty rozliczeniowe (bez gwarancji pełnej zgodności fiskalnej — usługodawca pozostaje odpowiedzialny za formalności).
- **Później:** pełne faktury fiskalne (numeracja sekwencyjna, NIP/VAT, zgodność per kraj).

## Rozliczenia z platformą i subskrypcja

Dedykowany widok **Rozliczenia** w ustawieniach. Na górze — **duży podgląd aktualnej prowizji**, z rozbiciem:

- **stawka bazowa**: **7,5%** bez abonamentu albo **4,5%** z abonamentem **Pro**, plus status abonamentu i data odnowienia,
- **zniżka za polecenia**: **−1 p.p.** i liczba **pozostałych miesięcy** (zob. [Polecenia](./20-referrals.md)),
- ewentualna **specjalna stawka od platformy** (super admin) i do kiedy obowiązuje,
- przycisk włączenia/zarządzania abonamentem **Pro (11 €/mc)** i co odblokowuje.

Abonament **Pro** daje niższą prowizję (4,5%) oraz funkcje premium — na dziś: **Boost w wyszukiwarce** (wyżej w wynikach), **automatyczne linki do spotkań Google Meet** oraz **zaawansowana analityka** (prognozy, mapa popytu, porównanie cen, wskaźnik zaufania — zob. [Analityka](./30-analityka-i-statystyki.md)). Ręczny link do spotkania (Meet/Zoom/inny) jest zawsze dostępny za darmo.

Niżej: **faktury od platformy** do usługodawcy (prowizja i abonament).

## Kody rabatowe i promocje

Usługodawca może prowadzić dwa rodzaje obniżek na własne usługi:

### Kody rabatowe

Kod wpisywany przez klienta przy płatności.

- Procentowy lub kwotowy
- Dotyczy wybranych usług (lub wszystkich)
- Opcjonalne limity użycia (łączna liczba, limit per klient) i okno ważności

### Promocje czasowe

Automatyczna obniżka na wybrane produkty na określony czas — bez kodu. Aktywna w oknie, potem ceny wracają.

> Prowizja marketplace liczona jest od ceny **po rabacie** — usługodawca i platforma dzielą koszt rabatu proporcjonalnie.

---

⬅️ **Poprzedni:** [Ewidencja sprzętu](./18-equipment.md) · **Następny:** [Polecenia](./20-referrals.md) ➡️
