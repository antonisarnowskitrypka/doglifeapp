import { FieldValue } from 'firebase-admin/firestore'

const VALID_CATEGORIES = new Set([
  'trainer_behaviourist', 'sport_training', 'physiotherapy', 'grooming',
  'dietitian', 'facility_rental', 'petsitting', 'photography'
])
const VALID_SPECIES = new Set(['dog', 'cat'])

defineRouteMeta({
  openAPI: {
    tags: ['Organizations'],
    summary: 'Create an organization (draft) + owner membership',
    description: 'Provider creator: makes a `draft` organization (hidden, not bookable) and an active `owner` membership for the caller. Publishing happens later via the onboarding checklist. See dev-docs/20-accounts-and-membership.md.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'categoryKeys'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 80 },
              categoryKeys: { type: 'array', minItems: 1, items: { type: 'string' } },
              acceptedSpecies: { type: 'array', items: { type: 'string', enum: ['dog', 'cat'] } }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Organization + membership created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['organizationId', 'membershipId', 'slug'],
              properties: {
                organizationId: { type: 'string' },
                membershipId: { type: 'string' },
                slug: { type: 'string' }
              }
            }
          }
        }
      },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const body = await readBody<{ name?: string, categoryKeys?: string[], acceptedSpecies?: string[] }>(event)

  const name = (body.name || '').trim()
  if (name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Podaj nazwę firmy (min. 2 znaki).' })
  }

  const categoryKeys = [...new Set((body.categoryKeys || []).filter(k => VALID_CATEGORIES.has(k)))]
  if (!categoryKeys.length) {
    throw createError({ statusCode: 400, statusMessage: 'Wybierz co najmniej jedną kategorię.' })
  }

  const acceptedSpecies = [...new Set((body.acceptedSpecies || []).filter(s => VALID_SPECIES.has(s)))]
  if (!acceptedSpecies.length) acceptedSpecies.push('dog', 'cat')

  const db = adminDb()
  const orgRef = db.collection('organizations').doc()
  // Slug stays unique by appending a short slice of the generated doc id.
  const slug = `${slugify(name)}-${orgRef.id.slice(0, 6).toLowerCase()}`

  const memberRef = db.collection('organizationMembers').doc()

  const batch = db.batch()
  batch.set(orgRef, {
    name,
    slug,
    status: 'draft', // hidden until published (onboarding checklist)
    categoryKeys,
    acceptedSpecies,
    ownerId: decoded.uid,
    timezone: 'Europe/Warsaw',
    createdAt: FieldValue.serverTimestamp()
  })
  batch.set(memberRef, {
    organizationId: orgRef.id,
    userId: decoded.uid,
    role: 'owner',
    status: 'active',
    shortDescription: null,
    longDescription: null,
    invitedEmail: null,
    invitedAt: null,
    acceptedAt: FieldValue.serverTimestamp()
  })
  await batch.commit()

  return { organizationId: orgRef.id, membershipId: memberRef.id, slug }
})
