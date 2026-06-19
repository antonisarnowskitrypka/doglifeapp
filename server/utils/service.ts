/**
 * Server helpers for a single bookable **service** (subcollection `organizations/{orgId}/services`).
 * MVP scope: core fields + per-mode pricing + staff (data only) + duration. Events/courses/packages
 * are separate scheduling types (see dev-docs/28-service-categories.md). Delivery modes are gated by
 * the org-level config (`organization.delivery`); `searchCells` are precomputed for findability.
 * See [Search → Delivery Model](../docs/dev-docs/13-search.md).
 */

export const SERVICE_BOOKING_MODES = ['book_now', 'request', 'inquiry'] as const
export type ServiceBookingMode = typeof SERVICE_BOOKING_MODES[number]

/** Minimal shape of the org fields this module reads (gates + travel base coverage + currency). */
export interface OrgServiceContext {
  categoryKeys?: string[]
  acceptedSpecies?: string[]
  currency?: string
  delivery?: {
    online?: { enabled?: boolean }
    atClient?: { enabled?: boolean, base?: { searchCells?: string[] } | null }
    atLocation?: { enabled?: boolean }
  }
}

/** The persisted service document. */
export interface ServiceDoc {
  name?: string
  categoryKey?: string
  shortDescription?: string | null
  description?: string | null
  species?: string[]
  durationMin?: number
  operationalBufferMinutes?: number
  paymentMethods?: string[]
  deliveryModes?: string[]
  online?: { enabled?: boolean }
  atClient?: { enabled?: boolean }
  atLocation?: { locationIds?: string[] }
  pricing?: { online?: number | null, at_client?: number | null, at_location?: number | null }
  bookingMode?: string
  staffIds?: string[]
  languages?: string[]
  status?: string
}

/** Curated client response — omits the heavy precomputed `searchCells` + denormalized `tags`. */
export function serviceResponse(id: string, d: ServiceDoc) {
  return {
    id,
    name: d.name ?? '',
    categoryKey: d.categoryKey ?? '',
    shortDescription: d.shortDescription ?? null,
    description: d.description ?? null,
    species: d.species ?? [],
    durationMin: d.durationMin ?? 60,
    operationalBufferMinutes: d.operationalBufferMinutes ?? 0,
    paymentMethods: d.paymentMethods ?? ['online'],
    deliveryModes: d.deliveryModes ?? [],
    online: { enabled: d.online?.enabled ?? false },
    atClient: { enabled: d.atClient?.enabled ?? false },
    atLocation: { locationIds: d.atLocation?.locationIds ?? [] },
    pricing: {
      online: d.pricing?.online ?? null,
      at_client: d.pricing?.at_client ?? null,
      at_location: d.pricing?.at_location ?? null
    },
    bookingMode: d.bookingMode ?? 'book_now',
    staffIds: d.staffIds ?? [],
    languages: d.languages ?? [],
    status: d.status ?? 'active'
  }
}

/** Lowercased name tokens used as search `tags` until the real taxonomy UI lands (see dev-docs/13). */
export function tokenizeTags(name: string): string[] {
  return [...new Set(
    name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(t => t.length >= 2)
  )].slice(0, 20)
}

/**
 * Validate the service's delivery against the org gates and resolve everything that needs reads:
 * enabled modes, the valid `locationIds`, the precomputed `searchCells` (union of the linked
 * locations' coverage + the org travel-base coverage), the valid `staffIds` (defaulting to all
 * active members), and the denormalized `languages` union. Modes the org gate has off are dropped.
 */
export async function resolveServiceLinks(
  orgId: string,
  org: OrgServiceContext,
  input: { onlineEnabled: boolean, atClientEnabled: boolean, atLocationEnabled: boolean, locationIds: string[], staffIds: string[] }
) {
  const db = adminDb()
  const gates = org.delivery ?? {}
  const online = input.onlineEnabled && !!gates.online?.enabled
  const atClient = input.atClientEnabled && !!gates.atClient?.enabled
  const atLocation = input.atLocationEnabled && !!gates.atLocation?.enabled

  const cells = new Set<string>()
  let locationIds: string[] = []
  if (atLocation) {
    const locSnap = await db.collection('organizations').doc(orgId).collection('locations').get()
    const byId = new Map(locSnap.docs.map(d => [d.id, d.data()]))
    locationIds = input.locationIds.filter(id => byId.has(id))
    for (const id of locationIds) {
      const sc = byId.get(id)?.searchCells
      if (Array.isArray(sc)) for (const c of sc) cells.add(c as string)
    }
  }
  if (atClient) {
    const baseCells = org.delivery?.atClient?.base?.searchCells
    if (Array.isArray(baseCells)) for (const c of baseCells) cells.add(c)
  }

  const memSnap = await db.collection('organizationMembers')
    .where('organizationId', '==', orgId).where('status', '==', 'active').get()
  const activeIds = memSnap.docs.map(d => d.id)
  const memLang = new Map(memSnap.docs.map(d => [d.id, (d.get('languages') ?? []) as string[]]))
  let staffIds = input.staffIds.filter(id => activeIds.includes(id))
  if (!staffIds.length) staffIds = activeIds
  const langs = new Set<string>()
  for (const id of staffIds) for (const l of (memLang.get(id) ?? [])) langs.add(l)

  const deliveryModes: string[] = []
  if (online) deliveryModes.push('online')
  if (atClient) deliveryModes.push('at_client')
  if (atLocation) deliveryModes.push('at_location')

  return { online, atClient, atLocation, deliveryModes, locationIds, staffIds, languages: [...langs], searchCells: [...cells] }
}

export interface ServiceWriteInput {
  name?: string
  categoryKey?: string
  shortDescription?: string | null
  description?: string | null
  species?: string[]
  durationMin?: number
  operationalBufferMinutes?: number
  paymentMethods?: string[]
  online?: { enabled?: boolean }
  atClient?: { enabled?: boolean }
  atLocation?: { enabled?: boolean, locationIds?: string[] }
  pricing?: { online?: number, at_client?: number, at_location?: number }
  bookingMode?: string
  staffIds?: string[]
  status?: string
}

const VALID_SPECIES = new Set(['dog', 'cat'])
// Online is always available; cash is opt-in. More methods will come from provider payment settings.
const PAYMENT_METHODS = new Set(['online', 'cash'])
const priceMinor = (v: unknown) => Math.max(0, Math.round(Number(v) || 0))
const trimOrNull = (v: string | null | undefined, max: number) => (v ? String(v).slice(0, max) : null)

function resolvePaymentMethods(body: ServiceWriteInput, prev: ServiceDoc | undefined): string[] {
  const src = body.paymentMethods ?? prev?.paymentMethods ?? ['online']
  const methods = [...new Set(src.filter(m => PAYMENT_METHODS.has(m)))]
  if (!methods.includes('online')) methods.unshift('online')
  return methods
}

type ServiceLinks = Awaited<ReturnType<typeof resolveServiceLinks>>

function resolveSpecies(body: ServiceWriteInput, prev: ServiceDoc | undefined, org: OrgServiceContext): string[] {
  let species = [...new Set((body.species ?? prev?.species ?? []).filter(s => VALID_SPECIES.has(s)))]
  if (!species.length) species = [...new Set((org.acceptedSpecies ?? []).filter(s => VALID_SPECIES.has(s)))]
  return species.length ? species : ['dog', 'cat']
}

function resolveBookingMode(body: ServiceWriteInput, prev: ServiceDoc | undefined): ServiceBookingMode {
  if ((SERVICE_BOOKING_MODES as readonly string[]).includes(body.bookingMode ?? '')) return body.bookingMode as ServiceBookingMode
  return (prev?.bookingMode as ServiceBookingMode) ?? 'book_now'
}

function resolvePricing(body: ServiceWriteInput, prev: ServiceDoc | undefined, links: ServiceLinks) {
  return {
    online: links.online ? priceMinor(body.pricing?.online ?? prev?.pricing?.online) : null,
    at_client: links.atClient ? priceMinor(body.pricing?.at_client ?? prev?.pricing?.at_client) : null,
    at_location: links.atLocation ? priceMinor(body.pricing?.at_location ?? prev?.pricing?.at_location) : null
  }
}

/**
 * Validate + assemble the persisted service doc (without `createdAt`). Shared by create and patch;
 * `prev` supplies fallbacks on edit. Throws `errors.api.service.*` on invalid input. Enforces the
 * org delivery gates and precomputes `searchCells` via {@link resolveServiceLinks}.
 */
export async function buildServiceDoc(orgId: string, org: OrgServiceContext, body: ServiceWriteInput, prev?: ServiceDoc) {
  const name = (body.name ?? prev?.name ?? '').trim()
  if (name.length < 2) throw apiError(400, 'errors.api.service.nameRequired')

  const categoryKey = String(body.categoryKey ?? prev?.categoryKey ?? '')
  if (!(org.categoryKeys ?? []).includes(categoryKey)) throw apiError(400, 'errors.api.service.categoryInvalid')

  const links = await resolveServiceLinks(orgId, org, {
    onlineEnabled: body.online?.enabled ?? prev?.online?.enabled ?? false,
    atClientEnabled: body.atClient?.enabled ?? prev?.atClient?.enabled ?? false,
    atLocationEnabled: body.atLocation?.enabled ?? (prev?.deliveryModes?.includes('at_location') ?? false),
    locationIds: body.atLocation?.locationIds ?? prev?.atLocation?.locationIds ?? [],
    staffIds: body.staffIds ?? prev?.staffIds ?? []
  })
  if (!links.deliveryModes.length) throw apiError(400, 'errors.api.service.deliveryRequired')
  if (links.atLocation && !links.locationIds.length) throw apiError(400, 'errors.api.service.locationRequired')

  return {
    organizationId: orgId,
    name: name.slice(0, 120),
    categoryKey,
    shortDescription: trimOrNull(body.shortDescription ?? prev?.shortDescription, 160),
    description: trimOrNull(body.description ?? prev?.description, 2000),
    species: resolveSpecies(body, prev, org),
    durationMin: Math.min(1440, Math.max(5, Math.round(Number(body.durationMin ?? prev?.durationMin) || 60))),
    operationalBufferMinutes: Math.min(240, Math.max(0, Math.round(Number(body.operationalBufferMinutes ?? prev?.operationalBufferMinutes) || 0))),
    paymentMethods: resolvePaymentMethods(body, prev),
    deliveryModes: links.deliveryModes,
    online: { enabled: links.online },
    atClient: { enabled: links.atClient },
    atLocation: { locationIds: links.locationIds },
    pricing: resolvePricing(body, prev, links),
    bookingMode: resolveBookingMode(body, prev),
    staffIds: links.staffIds,
    languages: links.languages,
    tags: tokenizeTags(name),
    status: (body.status ?? prev?.status) === 'hidden' ? 'hidden' : 'active',
    searchCells: links.searchCells
  }
}
