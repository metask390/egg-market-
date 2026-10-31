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
    const { data: type } = await admin.from('game_chicken_types').select('id,price,price_rs').eq('id', deposit.chicken_type_id).single(); const quantity = Math.max(1, Number(deposit.quantity || 1)); const chickens = Array.from({ length: quantity }, () => ({ user_id: deposit.user_id, chicken_type_id: deposit.chicken_type_id, last_collected_at: null }))
    const { error: chickenError } = await admin.from('game_user_chickens').insert(chickens); if (chickenError) throw chickenError
    const { data: owner } = await admin.from('game_users').select('total_invested,direct_withdraw_limit,referred_by').eq('user_id', deposit.user_id).single(); const amount = Number(deposit.total_amount || 0)
    const { error: ownerError } = await admin.from('game_users').update({ total_invested: Number(owner?.total_invested || 0) + amount, direct_withdraw_limit: Number(owner?.direct_withdraw_limit || 0) + amount * .3 }).eq('user_id', deposit.user_id); if (ownerError) throw ownerError
    if (owner?.referred_by) {
      const unitPrice = Number(type?.price ?? type?.price_rs ?? (quantity ? amount / quantity : amount)); const referralBonus = Math.min(amount * .5, unitPrice * Math.min(quantity, 2) * .5)
      const { data: referrer } = await admin.from('game_users').select('referral_withdraw_limit').eq('user_id', owner.referred_by).single()
      await admin.from('game_users').update({ referral_withdraw_limit: Number(referrer?.referral_withdraw_limit || 0) + referralBonus }).eq('user_id', owner.referred_by)
      await admin.from('game_referral_earnings').insert({ referrer_id: owner.referred_by, referred_user_id: deposit.user_id, deposit_id: deposit.id, amount: referralBonus, status: 'earned' })
    }
    const { error: approvalError } = await admin.from('game_deposits').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id).eq('status', 'pending'); if (approvalError) throw approvalError
    return Response.json({ ok: true })
  } catch (error) { return errorResponse(error) }
}
