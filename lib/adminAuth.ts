import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { PRIMARY_ADMIN_EMAIL } from '@/lib/adminConstants'

export { PRIMARY_ADMIN_EMAIL }

export async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Unauthorized')
  const admin = getSupabaseAdmin()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user?.email) throw new Error('Unauthorized')
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
  const allowed = new Set([PRIMARY_ADMIN_EMAIL, ...configured])
  if (!allowed.has(user.email.toLowerCase())) throw new Error('Admin access required')
  return { admin, user }
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Request failed'
  const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 400
  return Response.json({ error: message }, { status })
}
