import { NextRequest } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try { const { admin } = await requireAdmin(request); const { data, error } = await admin.from('game_settings').select('*').limit(1).maybeSingle(); if (error) throw error; return Response.json(data || {}) } catch (error) { return errorResponse(error) }
}
export async function POST(request: NextRequest) {
  try { const { admin } = await requireAdmin(request); const body = await request.json(); const payload = { id: body.id || 'default', easypaisa_name: body.easypaisa_name || '', easypaisa_number: body.easypaisa_number || '', jazzcash_name: body.jazzcash_name || '', jazzcash_number: body.jazzcash_number || '', bank_name: body.bank_name || '', bank_account_name: body.bank_account_name || '', bank_account_number: body.bank_account_number || '', updated_at: new Date().toISOString() }; const { data, error } = await admin.from('game_settings').upsert(payload).select().single(); if (error) throw error; return Response.json(data) } catch (error) { return errorResponse(error) }
}
