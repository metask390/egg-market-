import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const { data, error } = await admin.from('game_withdrawals').select('*').eq('status', 'pending').order('created_at', { ascending: true }); if (error) throw error
    const ids = Array.from(new Set((data || []).map(row => row.user_id).filter(Boolean))); const { data: users } = await admin.from('game_users').select('user_id,wallet_balance,direct_withdraw_limit,referral_withdraw_limit').in('user_id', ids.length ? ids : ['none']); const map = Object.fromEntries((users || []).map(row => [row.user_id, row]))
    return Response.json((data || []).map(row => ({ ...row, user: map[row.user_id] || {} })))
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request); const body = await request.json(); const id = String(body.id || ''); const action = body.action === 'approve' ? 'approve' : 'reject'; const { data: withdrawal, error: withdrawalError } = await admin.from('game_withdrawals').select('*').eq('id', id).eq('status', 'pending').single(); if (withdrawalError || !withdrawal) throw new Error('Pending withdrawal not found')
    if (action === 'reject') { const { error } = await admin.from('game_withdrawals').update({ status: 'rejected', rejection_reason: body.reason || null }).eq('id', id); if (error) throw error; return Response.json({ ok: true }) }
    const { data: user, error: userError } = await admin.from('game_users').select('wallet_balance,direct_withdraw_limit,referral_withdraw_limit,total_withdrawn').eq('user_id', withdrawal.user_id).single(); if (userError || !user) throw new Error('User wallet not found')
    const amount = Number(withdrawal.amount || 0); if (amount < 50) throw new Error('Minimum withdrawal is 50 Rs'); if (amount > 1000) throw new Error('Maximum withdrawal per day is 1000 Rs')
    const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0); const { data: todaysWithdrawals, error: dailyError } = await admin.from('game_withdrawals').select('amount').eq('user_id', withdrawal.user_id).neq('id', withdrawal.id).gte('created_at', dayStart.toISOString()).in('status', ['pending', 'completed']); if (dailyError) throw dailyError
    const dailyTotal = (todaysWithdrawals || []).reduce((sum, row) => sum + Number(row.amount || 0), 0); if (dailyTotal > 1000) throw new Error('Daily withdrawal limit is already exceeded'); if (dailyTotal > 0 && dailyTotal + amount > 1000) throw new Error(`Only ${(1000 - dailyTotal).toLocaleString()} Rs remain in today\'s withdrawal limit`); if (Number(user.wallet_balance || 0) < amount) throw new Error('Insufficient wallet balance')
    let remaining = amount; const direct = Math.min(Number(user.direct_withdraw_limit || 0), remaining); remaining -= direct; const referral = Math.min(Number(user.referral_withdraw_limit || 0), remaining); remaining -= referral; if (remaining > .001) throw new Error('Withdrawal exceeds available withdrawal limits')
    const { error: updateError } = await admin.from('game_users').update({ wallet_balance: Number(user.wallet_balance || 0) - amount, direct_withdraw_limit: Number(user.direct_withdraw_limit || 0) - direct, referral_withdraw_limit: Number(user.referral_withdraw_limit || 0) - referral, total_withdrawn: Number(user.total_withdrawn || 0) + amount }).eq('user_id', withdrawal.user_id); if (updateError) throw updateError
    const { error: statusError } = await admin.from('game_withdrawals').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', id).eq('status', 'pending'); if (statusError) throw statusError
    return Response.json({ ok: true })
  } catch (error) { return errorResponse(error) }
}
