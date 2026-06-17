# Szablony

Usługodawca może tworzyć szablony, żeby nie pisać tego samego za każdym razem. Są dwa rodzaje.

## Szablony treści

Gotowe bloki do wstawienia ręcznie w [Przestrzeni sesji](./12-session-workspace.md):

- **Szablon notatki**
- **Szablon zaleceń**
- (a także pracy domowej, instrukcji, materiałów)

Możesz mieć kilka szablonów każdego rodzaju i wybrać odpowiedni podczas wypełniania sesji.

## Szablony lekcji / usługi

Przypisane do **usługi** lub **pakietu/kursu** — automatycznie przygotowują sesję, gdy klient zarezerwuje. Przykłady:

- usługa *Konsultacja* zawsze wysyła zalecenia/instrukcje do przygotowania,
- kurs *Grzeczne Czekanie* od razu udostępnia materiały do nauki.

### Kiedy się odpalają

- **Usługa** — zawartość pojawia się po **potwierdzeniu rezerwacji**.
- **Pakiet/kurs** — od razu **po zakupie**.

### Pola metryk sesji

W ustawieniach szablonu sesji możesz zdefiniować **pola do zbierania danych** — liczbowe lub tekstowe — szczególnie przydatne dla fizjo (np. prędkość na bieżni, siła, tętno). Pola liczbowe mogą mieć jednostkę (km/h, bpm). Możesz też dodać pole **ad-hoc** wprost w sesji. Zebrane wartości są **widoczne dla klienta** i porównywane sesja-do-sesji (zob. [Szczegóły rezerwacji i historia](./13-booking-detail-and-history.md)).

### Co i kiedy widzi klient

| Element | Klient widzi… |
|---|---|
| Instrukcje przed wizytą | **od razu** |
| Materiały / załączniki | **od razu** |
| Zalecenia | **dopiero gdy usługodawca ręcznie wyśle** (lądują jako „oczekujące", trzeba kliknąć „wyślij") |
| Praca domowa | **dopiero po ręcznym wysłaniu** (tak samo „oczekujące" → wysłane) |

Dzięki temu materiały i instrukcje docierają automatycznie, a zalecenia i pracę domową usługodawca może najpierw przejrzeć/dopasować i dopiero wysłać.

---

⬅️ **Poprzedni:** [Banowanie klienta](./21-client-ban.md) · **Następny:** [Certyfikaty](./28-certificates.md) ➡️
