# Profil usługodawcy

Gdy klient otwiera profil usługodawcy, strona jest podzielona na trzy zakładki.

## USŁUGI

Lista usług usługodawcy. Każda usługa prowadzi bezpośrednio do procesu rezerwacji.

- Przeglądaj dostępne typy usług i ceny
- Kliknij usługę, aby rozpocząć rezerwację (zob. [Rezerwacja usługi](./07-booking-a-service.md))

## O FIRMIE

Informacje o organizacji:

- Dane firmy
- Opis — **krótki** (zawsze widoczny przy nazwie/avatarze) i **długi** (po „pokaż więcej")
- Opinie / oceny (zob. [Opinie](./14-reviews.md))
- Certyfikaty

Krótki i długi opis mają też **pracownicy** i **usługi** — krótki towarzyszy nazwie/avatarowi, długi rozwija się po „pokaż więcej" (dokładny wygląd w UI-docs).

## CZAT

Ogólny czat klient–usługodawca do pytań przed rezerwacją.

- Pozwala klientowi zadać pytania **przed** dokonaniem rezerwacji
- Rozmowa jest z organizacją (nie z konkretnym pracownikiem)
- Przydatny do doprecyzowania szczegółów, dostępności lub doboru usługi

> Uwaga: w obrębie pojedynczej rezerwacji nie ma czatu — komunikacja odbywa się przez **komentarze do załączników i zaleceń** w [Przestrzeni sesji](./12-session-workspace.md). Wyjątkiem są **eventy grupowe**, które mają osobny czat grupowy (zob. niżej).

### Propozycja wizyty na czacie

W czacie usługodawca ma widoczną akcję **„Zaproponuj wizytę"**. Tworzy ona kartę propozycji — **to nie jest rezerwacja** (nie ma jeszcze wybranego zwierzaka, pytań ani regulaminu), tylko **skrót** do rezerwacji z wypełnionym dniem, usługą, trybem i ceną.

- **Cena** jest domyślnie standardowa dla danego trybu, ale usługodawca może ją zmienić (ikonka edycji) przed wysłaniem.
- Klient może **wejść** w propozycję — otwiera się rezerwacja z wypełnionymi danymi. „Wstępnie zaakceptowana" znaczy tylko, że pomijamy 24h potwierdzenie usługodawcy — **klient i tak musi przejść standardowe kroki**: wybrać zwierzaka, odpowiedzieć na **wymagane pytania** usługodawcy (agresja, stosunek do innych zwierząt itd.) i zaakceptować regulamin, a potem **od razu płaci**. Albo klient może propozycję **usunąć**.
- Propozycja **nie blokuje terminu i nie wygasa** — żyje, dopóki usługodawca jej nie usunie albo termin nie zostanie zajęty. Kto pierwszy zarezerwuje i zapłaci, ten ma.

## Czat eventu grupowego

Event grupowy (np. spacer grupowy, seminarium) ma własny czat dający kontekst **całej grupie wszystkich zapisanych** uczestników oraz usługodawcy.

- **Dostęp** mają tylko aktualnie zapisani uczestnicy. Po anulowaniu zapisu tracisz dostęp do czatu.
- **Tryb klienta** (ustawienie wątku) — możesz wybrać, czy Twoje wiadomości trafiają do **wszystkich** w grupie, czy **tylko do usługodawcy**. W trybie „tylko usługodawca" wiadomość trafia do Twojego zwykłego [czatu z profilu](./06-provider-profile.md) (klient↔organizacja), a nie do czatu grupowego.
- **Usługodawca** może pisać do całej grupy albo przełączyć się na rozmowę **1:1 z dowolnym członkiem** — taka rozmowa również toczy się w czacie z profilu (klient↔organizacja).
- Dzięki temu **cała korespondencja 1:1 z usługodawcą jest w jednym miejscu** — w czacie profilowym — a czat grupowy pozostaje czysto grupowy.
- **Po evencie** czat pozostaje aktywny jeszcze przez 7 dni (na dokończenie rozmów), potem przechodzi w tryb tylko do odczytu i jest automatycznie usuwany po ok. 30 dniach.

---

⬅️ **Poprzedni:** [Wyszukiwanie](./05-search.md) · **Następny:** [Rezerwacja usługi](./07-booking-a-service.md) ➡️
