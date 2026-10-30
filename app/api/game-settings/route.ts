import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() { try { const admin = getSupabaseAdmin(); const { data, error } = await admin.from('game_settings').select('easypaisa_name,easypaisa_number,jazzcash_name,jazzcash_number,bank_name,bank_account_name,bank_account_number').limit(1).maybeSingle(); if (error) throw error; return Response.json(data || {}) } catch { return Response.json({ easypaisa_name: 'Admin', easypaisa_number: '03XX-XXXXXXX', jazzcash_name: 'Admin', jazzcash_number: '03XX-XXXXXXX' }) } }
