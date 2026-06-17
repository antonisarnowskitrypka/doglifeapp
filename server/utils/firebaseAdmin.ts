import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/**
 * Server-side Firebase Admin SDK — the ONLY place allowed to touch Firestore.
 * Clients never read/write Firestore directly (see dev-docs/03-firebase-and-security.md).
 *
 * LOCAL: connects to the Emulator Suite automatically via FIREBASE_AUTH_EMULATOR_HOST /
 * FIRESTORE_EMULATOR_HOST (set in .env). No service account needed for the demo project.
 * DEV/PROD: provide FIREBASE_SERVICE_ACCOUNT (JSON) — cert() credentials kick in then.
 */
const ADMIN_APP_NAME = 'doglife-admin'

let app: App | undefined

function getAdminApp(): App {
  if (app) return app

  const existing = getApps().find(a => a?.name === ADMIN_APP_NAME)
  if (existing) {
    app = existing
    return app
  }

  const projectId = process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-doglifeapp'
  const storageBucket = process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

  app = initializeApp(
    serviceAccount
      ? { credential: cert(JSON.parse(serviceAccount)), projectId, storageBucket }
      : { projectId, storageBucket }, // emulator / ADC
    ADMIN_APP_NAME
  )
  return app
}

export function adminAuth() {
  return getAuth(getAdminApp())
}

export function adminDb() {
  return getFirestore(getAdminApp())
}

export function adminBucket() {
  return getStorage(getAdminApp()).bucket()
}
