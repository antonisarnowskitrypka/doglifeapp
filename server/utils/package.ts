/**
 * Server helpers for a **package** — a plain bundle of interchangeable sessions sold for one price
 * and redeemable against one or more of the org's single services (subcollection
 * `organizations/{orgId}/packages`). MVP scope: definition only (price + sessionCount + serviceIds);
 * the purchase/redemption mechanics live in dev-docs/08-packages.md and are built separately.
 */

/** The persisted package definition document. */
export interface PackageDoc {
  name?: string
  description?: string | null
  sessionCount?: number
  price?: number
  serviceIds?: string[]
  status?: string
}

/** Curated client response. */
export function packageResponse(id: string, d: PackageDoc) {
  return {
    id,
    name: d.name ?? '',
    description: d.description ?? null,
    sessionCount: d.sessionCount ?? 1,
    price: d.price ?? 0,
    serviceIds: d.serviceIds ?? [],
    status: d.status ?? 'active'
  }
}

export interface PackageWriteInput {
  name?: string
  description?: string | null
  sessionCount?: number
  price?: number
  serviceIds?: string[]
  status?: string
}

const priceMinor = (v: unknown) => Math.max(0, Math.round(Number(v) || 0))
const trimOrNull = (v: string | null | undefined, max: number) => (v ? String(v).slice(0, max) : null)

/**
 * Validate + assemble the persisted package doc (without `createdAt`). Shared by create and patch;
 * `prev` supplies fallbacks on edit. `serviceIds` are filtered to the org's existing services.
 * Throws `errors.api.package.*` on invalid input.
 */
export async function buildPackageDoc(orgId: string, body: PackageWriteInput, prev?: PackageDoc) {
  const name = (body.name ?? prev?.name ?? '').trim()
  if (name.length < 2) throw apiError(400, 'errors.api.package.nameRequired')

  const svcSnap = await adminDb().collection('organizations').doc(orgId).collection('services').get()
  const valid = new Set(svcSnap.docs.map(d => d.id))
  const serviceIds = [...new Set((body.serviceIds ?? prev?.serviceIds ?? []).filter(id => valid.has(id)))]
  if (!serviceIds.length) throw apiError(400, 'errors.api.package.servicesRequired')

  return {
    organizationId: orgId,
    name: name.slice(0, 120),
    description: trimOrNull(body.description ?? prev?.description, 500),
    sessionCount: Math.min(100, Math.max(1, Math.round(Number(body.sessionCount ?? prev?.sessionCount) || 1))),
    price: priceMinor(body.price ?? prev?.price),
    serviceIds,
    status: (body.status ?? prev?.status) === 'hidden' ? 'hidden' : 'active'
  }
}
