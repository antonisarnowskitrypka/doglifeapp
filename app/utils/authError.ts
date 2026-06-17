/** Maps Firebase Auth error codes to friendly Polish messages. */
const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Nieprawidłowy adres e-mail.',
  'auth/user-disabled': 'To konto zostało zablokowane.',
  'auth/user-not-found': 'Nie znaleziono konta z tym adresem e-mail.',
  'auth/wrong-password': 'Nieprawidłowy e-mail lub hasło.',
  'auth/invalid-credential': 'Nieprawidłowy e-mail lub hasło.',
  'auth/email-already-in-use': 'Konto z tym adresem e-mail już istnieje.',
  'auth/weak-password': 'Hasło musi mieć co najmniej 6 znaków.',
  'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj ponownie za chwilę.',
  'auth/network-request-failed': 'Problem z połączeniem. Sprawdź internet i spróbuj ponownie.',
  'auth/missing-email': 'Podaj adres e-mail.',
  'auth/requires-recent-login': 'Ze względów bezpieczeństwa zaloguj się ponownie i spróbuj jeszcze raz.',
  'auth/expired-action-code': 'Link wygasł. Poproś o nowy.',
  'auth/invalid-action-code': 'Link jest nieprawidłowy lub został już użyty.'
}

export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code
  if (code && MESSAGES[code]) return MESSAGES[code]
  return 'Coś poszło nie tak. Spróbuj ponownie.'
}
