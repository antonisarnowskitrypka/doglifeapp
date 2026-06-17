import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'

/**
 * Auth facade over Firebase Auth + our `/api/auth/sync` mirror. The client only ever
 * touches `firebase/auth`; the `users` Firestore doc is written server-side after sign-in.
 * Providers: email/password, Google, Apple (Facebook + SMS verification dropped — see dev-docs/20).
 */
export function useAuth() {
  const auth = useFirebaseAuth()
  const user = useCurrentUser()
  const authFetch = useAuthFetch()

  /** Upsert the users doc for the signed-in account (idempotent). */
  function sync() {
    return authFetch('/api/auth/sync', { method: 'POST', body: { locale: 'pl' } })
  }

  function ensureAuth() {
    if (!auth) throw new Error('Firebase Auth is only available on the client')
    return auth
  }

  async function registerWithEmail(email: string, password: string, displayName?: string) {
    const cred = await createUserWithEmailAndPassword(ensureAuth(), email, password)
    if (displayName) await updateProfile(cred.user, { displayName })
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

  return {
    user,
    sync,
    registerWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut
  }
}
