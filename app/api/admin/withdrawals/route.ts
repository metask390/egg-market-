import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const { data, error } = await admin.from('game_withdrawals').select('*').eq('status', 'pending').order('created_at', { ascending: true }); if (error) throw error
    const ids = Array.from(new Set((data || []).map(row => row.user_id).filter(Boolean))); const { data: users } = await admin.from('game_users').select('id,email,username,wallet_balance,direct_withdraw_limit,referral_withdraw_limit').in('id', ids.length ? ids : ['none']); const map = Object.fromEntries((users || []).map(row => [row.id, row]))
    return Response.json((data || []).map(row => ({ ...row, user: map[row.user_id] || {} })))
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const body = await request.json(); const id = String(body.id || ''); const action = body.action === 'approve' ? 'approve' : 'reject'; const { data: withdrawal, error: withdrawalError } = await admin.from('game_withdrawals').select('*').eq('id', id).eq('status', 'pending').single(); if (withdrawalError || !withdrawal) throw new Error('Pending withdrawal not found')
    if (action === 'reject') { const { error } = await admin.from('game_withdrawals').update({ status: 'rejected', rejection_reason: body.reason || null }).eq('id', id); if (error) throw error; return Response.json({ ok: true }) }
    const { data: user, error: userError } = await admin.from('game_users').select('wallet_balance,direct_withdraw_limit,referral_withdraw_limit,total_withdrawn').eq('id', withdrawal.user_id).single(); if (userError || !user) throw new Error('User wallet not found')
    const amount = Number(withdrawal.amount || 0); if (Number(user.wallet_balance || 0) < amount) throw new Error('Insufficient wallet balance')
    let remaining = amount; const direct = Math.min(Number(user.direct_withdraw_limit || 0), remaining); remaining -= direct; const referral = Math.min(Number(user.referral_withdraw_limit || 0), remaining); remaining -= referral; if (remaining > .001) throw new Error('Withdrawal exceeds available withdrawal limits')
    const { error: updateError } = await admin.from('game_users').update({ wallet_balance: Number(user.wallet_balance || 0) - amount, direct_withdraw_limit: Number(user.direct_withdraw_limit || 0) - direct, referral_withdraw_limit: Number(user.referral_withdraw_limit || 0) - referral, total_withdrawn: Number(user.total_withdrawn || 0) + amount }).eq('id', withdrawal.user_id); if (updateError) throw updateError
    const { error: statusError } = await admin.from('game_withdrawals').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', id).eq('status', 'pending'); if (statusError) throw statusError
    return Response.json({ ok: true })
  } catch (error) { return errorResponse(error) }
}
