# Znajdowanie i rezerwacja usługi

## Odkrywanie

Klienci przeglądają marketplace według typu usługi, lokalizacji lub usługodawcy. Profile usługodawców i oferty usług są publicznie indeksowane pod SEO.

## Tryby rezerwacji

Usługodawca wybiera tryb per usługa. Są trzy:

### BOOK_NOW — rezerwacja natychmiastowa (domyślna)

Klient wybiera termin, płaci, a rezerwacja jest od razu potwierdzona.

### REQUEST — termin do potwierdzenia

Klient wybiera termin i **od razu płaci**, ale rezerwacja czeka na potwierdzenie usługodawcy (do 24h). Usługodawca może:

- **zatwierdzić** → rezerwacja potwierdzona,
- **zaproponować inny termin** → wraca do klienta (tylko **jedna** taka zmiana — żeby nie odbijać rezerwacji w nieskończoność; dalsze ustalenia przez czat). Klient akceptuje (potwierdzone) albo odrzuca (anulacja + pełny zwrot),
- **anulować** → pełny zwrot.

Jeśli usługodawca nie zareaguje w ciągu 24h, rezerwacja jest automatycznie anulowana z pełnym zwrotem.

### INQUIRY — na zapytanie (z wyceną)

Domyślny tryb dla petsittingu. Może go włączyć dowolny usługodawca dla dowolnej usługi.

Przebieg:
1. Klient składa zapytanie
2. Usługodawca przegląda i wysyła wycenę
3. Klient płaci
4. Rezerwacja zostaje potwierdzona

## Rezerwacja jako gość

Klient może zarezerwować bez zakładania konta.

Przebieg:
1. Podaje adres e-mail
2. Automatycznie tworzone jest konto gościa
3. Na e-mail wysyłany jest magic link
4. Gość może później aktywować pełne konto

Goście **nie potrzebują numeru telefonu** (nie otrzymują nagród za polecenia, więc nie ma wektora nadużyć). Usługodawca może jednak oznaczyć **numer telefonu jako pole wymagane** w formularzu zapisu na swoją usługę — wtedy gość musi go podać, aby zarezerwować.

Usługodawca może też **wyłączyć obsługę gości** i wymusić rejestrację (domyślnie włączone goście). Wtedy rezerwacja u niego wymaga konta.

## Ceny i VAT

Cena zależy od wybranego **trybu realizacji** — ta sama usługa może mieć inną cenę w lokacji, z dojazdem do Ciebie i online (zob. [Wyszukiwanie](./05-search.md)).

Ceny pokazywane są **z VAT-em**, z notką w stylu *„cena zawiera 23% VAT"* na podstawie stawki VAT usługodawcy. Klient z [danymi firmowymi](./02-accounts.md) może poprosić o wystawienie faktury na firmę.

## Krok po kroku: rezerwacja natychmiastowa

1. Otwórz profil usługodawcy lub ofertę usługi
2. Wybierz usługę
3. Wybierz dostępny dzień i godzinę
4. Sprawdź szczegóły rezerwacji
5. Przejdź do Stripe Checkout
6. Otrzymaj potwierdzenie (e-mail + powiadomienie push)

## Wybór zwierzaków

Podczas rezerwacji klient wybiera, którego zwierzaka dotyczy usługa. Usługi przyjmujące kilka zwierzaków (wydarzenia, spacery grupowe, niektóre konsultacje) pozwalają wybrać **kilka zwierzaków naraz**. Każdy zwierzak zajmuje jedno miejsce; cena jest naliczana za zwierzaka lub za rezerwację, w zależności od konfiguracji usługi. Zob. [Zwierzaki](./04-pets.md).

## Wybór pracownika

Jeśli usługę świadczy kilku pracowników, możesz wskazać **konkretną osobę** albo zostawić **„dowolny dostępny"** (domyślnie):

- **Konkretny pracownik** — widzisz tylko jego wolne terminy.
- **Dowolny dostępny** — widzisz terminy wszystkich pracujących przy tej usłudze, a po rezerwacji system sam przypisze **najmniej obłożoną** wolną osobę w danym dniu.

Usługodawca (właściciel) może później **zmienić przypisanego pracownika** w rezerwacji — dostaniesz wtedy powiadomienie, kto poprowadzi usługę.

## Wymagane pytania o zwierzaka

Usługodawca może wymagać odpowiedzi na standardowe pytania handlingowe (np. *czy zwierzak jest agresywny?*, *stosunek do psów/kotów*) przed dokonaniem rezerwacji. Podczas rezerwacji:

- Już udzielone odpowiedzi są podpowiadane z rekordu zwierzaka.
- Brakujące wymagane odpowiedzi trzeba uzupełnić, aby kontynuować.
- Odpowiedzi są zapisywane na rekordzie zwierzaka i używane ponownie przy kolejnych rezerwacjach.

## Akceptacja regulaminu usługodawcy

Podczas rezerwacji klient akceptuje regulamin i politykę RODO usługodawcy. Jest to zapamiętane per usługodawca i wymagane ponownie tylko, gdy usługodawca opublikuje nową wersję — zob. [Regulamin i RODO usługodawcy](./08-terms-and-gdpr.md).

## Krok po kroku: rezerwacja na zapytanie (INQUIRY)

1. Otwórz profil usługodawcy
2. Wybierz usługę z włączonym trybem INQUIRY
3. Opisz swoje potrzeby i wyślij zapytanie
4. Poczekaj na wycenę od usługodawcy (usługodawca ustala termin na decyzję)
5. Przejrzyj i zaakceptuj wycenę — nie ma negocjacji
6. Zapłać przez Stripe Checkout przed upływem terminu
7. Otrzymaj potwierdzenie

> Jeśli wycena nie zostanie opłacona przed terminem usługodawcy, zapytanie jest **automatycznie anulowane**.

---

⬅️ **Poprzedni:** [Profil usługodawcy](./06-provider-profile.md) · **Następny:** [Regulamin i RODO](./08-terms-and-gdpr.md) ➡️
