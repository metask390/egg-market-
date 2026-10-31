import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request)
    const { data, error } = await admin.from('game_deposits').select('*').eq('status', 'pending').order('created_at', { ascending: true })
    if (error) throw error
    const rows = data || []; const userIds = Array.from(new Set(rows.map(row => row.user_id).filter(Boolean))); const typeIds = Array.from(new Set(rows.map(row => row.chicken_type_id).filter(Boolean)))
    const [{ data: users }, { data: types }] = await Promise.all([admin.from('game_users').select('user_id').in('user_id', userIds.length ? userIds : ['none']), admin.from('game_chicken_types').select('id,name,chicken_name,price,price_rs,egg_value').in('id', typeIds.length ? typeIds : ['none'])])
    const userMap = Object.fromEntries((users || []).map(row => [row.user_id, row])); const typeMap = Object.fromEntries((types || []).map(row => [row.id, row]))
    return Response.json(rows.map(row => ({ ...row, user: userMap[row.user_id] || {}, chicken: typeMap[row.chicken_type_id] || {} })))
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const body = await request.json(); const id = String(body.id || ''); const action = body.action === 'approve' ? 'approve' : 'reject'
    const { data: deposit, error: depositError } = await admin.from('game_deposits').select('*').eq('id', id).eq('status', 'pending').single(); if (depositError || !deposit) throw new Error('Pending deposit not found')
    if (action === 'reject') { const { error } = await admin.from('game_deposits').update({ status: 'rejected', rejection_reason: body.reason || null }).eq('id', id); if (error) throw error; return Response.json({ ok: true }) }
    const { error: approvalError } = await admin.rpc('approve_game_deposit', { p_deposit_id: id }); if (approvalError) { console.error('approve_game_deposit failed', approvalError); return Response.json({ error: approvalError.message }, { status: 400 }) }
    return Response.json({ ok: true })
  } catch (error) { return errorResponse(error) }
}
