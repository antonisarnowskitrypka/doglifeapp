import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile
} from 'firebase/auth'

interface SyncResult {
  uid: string
  created: boolean
  /** True when this sign-in cancelled a pending account deletion (see /api/auth/sync). */
  deletionCancelled?: boolean
}

/**
 * Auth facade over Firebase Auth + our `/api/auth/sync` mirror. The client only ever
 * touches `firebase/auth`; the `users` Firestore doc is written server-side after sign-in.
 * Providers: email/password, Google, Apple (Facebook + SMS verification dropped — see dev-docs/20).
 */
export function useAuth() {
  const auth = useFirebaseAuth()
  const user = useCurrentUser()
  const authFetch = useAuthFetch()
  const toast = useToast()
  const { t } = useI18n()

  /** Upsert the users doc for the signed-in account (idempotent). */
  async function sync() {
    const res = await authFetch<SyncResult>('/api/auth/sync', { method: 'POST', body: { locale: 'pl' } })
    // Signing back in within the 7-day window halts a scheduled deletion (see settings.vue).
    if (res?.deletionCancelled) {
      toast.add({
        title: t('auth.deletionCancelled.title'),
        description: t('auth.deletionCancelled.body'),
        color: 'success',
        icon: 'i-lucide-shield-check'
      })
    }
    return res
  }

  function ensureAuth() {
    if (!auth) throw new Error('Firebase Auth is only available on the client')
    return auth
  }

  async function registerWithEmail(email: string, password: string, displayName?: string) {
    const cred = await createUserWithEmailAndPassword(ensureAuth(), email, password)
    if (displayName) await updateProfile(cred.user, { displayName })
    // Kick off email verification right away; the in-app banner lets them resend if it fails.
    await sendEmailVerification(cred.user).catch(() => {})
    await sync()
    return cred.user
  }

  async function signInWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(ensureAuth(), email, password)
    await sync()
    return cred.user
  }

  async function signInWithGoogle() {
    await signInWithPopup(ensureAuth(), new GoogleAuthProvider())
    await sync()
  }

  async function signInWithApple() {
    await signInWithPopup(ensureAuth(), new OAuthProvider('apple.com'))
    await sync()
  }

  async function signOut() {
    await firebaseSignOut(ensureAuth())
  }

  /** Send a password-reset email. On LOCAL the link lands in the Auth emulator logs/UI. */
  function sendPasswordReset(email: string) {
    return sendPasswordResetEmail(ensureAuth(), email)
  }

  /** (Re)send the verification email to the current user. */
  async function sendVerification() {
    const u = ensureAuth().currentUser
    if (!u) throw new Error('No signed-in user')
    await sendEmailVerification(u)
  }

  /**
   * Change the password of an email/password account. Reauthenticates with the current
   * password first — this both verifies it and clears Firebase's `requires-recent-login`.
   */
  async function changePassword(currentPassword: string, newPassword: string) {
    const u = ensureAuth().currentUser
    if (!u?.email) throw new Error('Account has no password provider')
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, currentPassword))
    await updatePassword(u, newPassword)
  }

  /** Whether the signed-in account has an email/password provider (vs social-only). */
  function hasPasswordProvider() {
    return !!auth?.currentUser?.providerData.some(p => p.providerId === 'password')
  }

  /**
   * Request soft account deletion: the server schedules removal in 7 days and we sign out.
   * Signing back in before then cancels it (handled in /api/auth/sync). The actual, safe
   * cascade is performed by a super-admin so historical records stay intact.
   */
  async function requestAccountDeletion() {
    await authFetch('/api/me/request-deletion', { method: 'POST' })
    await firebaseSignOut(ensureAuth())
  }

  return {
    user,
    sync,
    registerWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    sendPasswordReset,
    sendVerification,
    changePassword,
    hasPasswordProvider,
    requestAccountDeletion
  }
}
