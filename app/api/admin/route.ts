import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request)
    const [{ count: users }, { count: deposits }, { count: withdrawals }, { data: revenueRows }] = await Promise.all([
      admin.from('game_users').select('id', { count: 'exact', head: true }),
      admin.from('game_deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('game_withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('game_deposits').select('amount').eq('status', 'approved')
    ])
    const revenue = (revenueRows || []).reduce((sum: number, row: { amount?: number }) => sum + Number(row.amount || 0), 0)
    return Response.json({ users: users || 0, pendingDeposits: deposits || 0, pendingWithdrawals: withdrawals || 0, revenue })
  } catch (error) { return errorResponse(error) }
}
