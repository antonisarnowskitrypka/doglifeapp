import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

/**
 * `$fetch` wrapper that attaches the current user's Firebase ID token as a Bearer header,
 * so authed server routes can verify identity (see server/utils/requireUser.ts).
 * The client never reads Firestore directly — it always goes through these server routes.
 */
export function useAuthFetch() {
  return async function authFetch<T = unknown>(
    url: NitroFetchRequest,
    opts: NitroFetchOptions<NitroFetchRequest> = {}
  ): Promise<T> {
    const user = await getCurrentUser()
    const token = user ? await user.getIdToken() : null

    return $fetch<T>(url, {
      ...opts,
      headers: {
        ...(opts.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }) as Promise<T>
  }
}
