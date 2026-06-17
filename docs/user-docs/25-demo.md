# Strona demo

Publiczna strona pokazująca potencjalnemu usługodawcy, jak działa platforma — na fikcyjnych danych i z symulacją zdarzeń, bez rejestracji.

## Czym jest

- **Prowadzony tour** po gotowej organizacji demo z realistycznymi, wypełnionymi danymi (usługi, kalendarz, klienci, zwierzaki, historia).
- Dane są **tylko do odczytu** — odwiedzający przegląda prawdziwe ekrany usługodawcy, ale nic, co zrobi, nie jest zapisywane.

## Symulacja zdarzeń

Odwiedzający może wyzwalać zdarzenia przyciskami i obserwować reakcję panelu w czasie rzeczywistym, np.:

- „Symuluj nową rezerwację" → pojawia się rezerwacja, kalendarz się aktualizuje, leci powiadomienie
- „Symuluj płatność" → aktualizują się escrow/zarobki
- „Symuluj opinię" → na profilu pojawia się nowa opinia

Pokazuje to żywy przepływ (rezerwacja → płatność → sesja → opinia) na żądanie.

## Bezpieczeństwo

- Wszystkie dane są fikcyjne i **izolowane** — nigdy nie dotykają prawdziwych danych produkcyjnych.
- Każda wizyta jest **ulotna**: symulowane zmiany żyją tylko w danej sesji i są potem odrzucane.
- Nie są wysyłane żadne prawdziwe płatności, e-maile ani powiadomienia push.

## Cel

Pozwolić potencjalnemu usługodawcy doświadczyć panelu i pełnego przepływu, zanim zdecyduje się założyć konto.

---

⬅️ **Poprzedni:** [Super Admin](./24-super-admin.md) · **Następny:** [Co dalej](./29-post-mvp.md) ➡️
