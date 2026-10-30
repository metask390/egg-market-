import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const { data: users, error } = await admin.from('game_users').select('*').order('created_at', { ascending: false }); if (error) throw error
    const ids = (users || []).map(user => user.id); const { data: chickens } = await admin.from('game_user_chickens').select('user_id').in('user_id', ids.length ? ids : ['none']); const counts = (chickens || []).reduce<Record<string, number>>((all, chicken) => { all[chicken.user_id] = (all[chicken.user_id] || 0) + 1; return all }, {})
    return Response.json((users || []).map(user => ({ ...user, chicken_count: counts[user.id] || 0 })))
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: NextRequest) {
  try { const { admin } = await requireAdmin(request); const body = await request.json(); const { error } = await admin.from('game_users').update({ is_blocked: Boolean(body.is_blocked) }).eq('id', body.id); if (error) throw error; return Response.json({ ok: true }) } catch (error) { return errorResponse(error) }
}
