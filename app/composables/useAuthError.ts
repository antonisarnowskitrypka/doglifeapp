/** Maps Firebase Auth error codes to i18n keys in the `errors.auth.*` namespace. */
const CODE_TO_KEY: Record<string, string> = {
  'auth/invalid-email': 'errors.auth.invalidEmail',
  'auth/user-disabled': 'errors.auth.userDisabled',
  'auth/user-not-found': 'errors.auth.userNotFound',
  'auth/wrong-password': 'errors.auth.wrongPassword',
  'auth/invalid-credential': 'errors.auth.invalidCredential',
  'auth/email-already-in-use': 'errors.auth.emailAlreadyInUse',
  'auth/weak-password': 'errors.auth.weakPassword',
  'auth/too-many-requests': 'errors.auth.tooManyRequests',
  'auth/network-request-failed': 'errors.auth.networkRequestFailed',
  'auth/missing-email': 'errors.auth.missingEmail',
  'auth/requires-recent-login': 'errors.auth.requiresRecentLogin',
  'auth/expired-action-code': 'errors.auth.expiredActionCode',
  'auth/invalid-action-code': 'errors.auth.invalidActionCode'
}

/** Resolve a friendly, translated message from a thrown Firebase Auth error. */
export function useAuthError() {
  const { t } = useI18n()

  function authErrorMessage(e: unknown): string {
    const code = (e as { code?: string })?.code
    const key = code ? CODE_TO_KEY[code] : undefined
    return key ? t(key) : t('errors.generic')
  }

  return { authErrorMessage }
}
