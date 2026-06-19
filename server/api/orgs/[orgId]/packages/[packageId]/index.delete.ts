defineRouteMeta({
  openAPI: {
    tags: ['Packages'],
    summary: 'Delete a package',
    description: 'Owner-only. Removes the package definition. (Existing purchases keep their own records — see dev-docs/08-packages.md.)',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'packageId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    responses: {
      200: { description: 'Deleted' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Package not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const packageId = getRequiredParam(event, 'packageId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('packages').doc(packageId)
  if (!(await ref.get()).exists) throw apiError(404, 'errors.api.package.notFound')

  await ref.delete()
  return { ok: true }
})
