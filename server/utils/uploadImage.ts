import { randomUUID } from 'node:crypto'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB (dev-docs/23-storage.md)

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic'
}

/**
 * Uploads an image to Storage (Admin SDK) and returns a stable download URL.
 * Clients never write Storage directly — this runs only inside server routes
 * (see dev-docs/03 & 23). Works against the emulator (STORAGE_EMULATOR_HOST) and prod.
 *
 * `pathBase` is the object path WITHOUT extension (the extension is derived from the type),
 * e.g. `users/{uid}/avatar` → `users/{uid}/avatar.jpg`.
 */
export async function uploadImage(opts: { buffer: Buffer, contentType: string, pathBase: string }): Promise<string> {
  const { buffer, contentType, pathBase } = opts

  if (!ALLOWED_TYPES.has(contentType)) {
    throw createError({ statusCode: 400, statusMessage: 'Niedozwolony typ pliku (dozwolone: JPG, PNG, WEBP, HEIC).' })
  }
  if (buffer.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Plik za duży (maks. 10 MB).' })
  }

  const path = `${pathBase}.${EXT[contentType]}`
  const token = randomUUID()
  const bucket = adminBucket()

  await bucket.file(path).save(buffer, {
    resumable: false,
    contentType,
    metadata: { metadata: { firebaseStorageDownloadTokens: token } }
  })

  const encoded = encodeURIComponent(path)
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST
  const base = emulatorHost
    ? `http://${emulatorHost}/v0/b/${bucket.name}/o/${encoded}`
    : `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}`

  return `${base}?alt=media&token=${token}`
}

/** Reads the first file part from a multipart request, returning its buffer + type. */
export async function readUploadedImage(event: Parameters<typeof readMultipartFormData>[0]) {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.filename && p.data?.length)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Brak pliku.' })
  }
  return { buffer: file.data as Buffer, contentType: file.type || 'application/octet-stream' }
}
