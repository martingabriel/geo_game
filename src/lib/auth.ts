/**
 * Checks if the incoming request has a valid admin session cookie.
 * Parses the Cookie header manually to avoid depending on Next.js request types.
 */
export function isAdminAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader.split(';').some((part) => part.trim() === 'admin_session=1')
}
