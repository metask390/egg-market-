import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.from('game_settings').select('easypaisa_name,easypaisa_number,jazzcash_name,jazzcash_number,bank_name,bank_account_name,bank_account_number').eq('id', 1).maybeSingle()
    if (error) throw error
    return Response.json(data || {})
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Payment settings could not be loaded' }, { status: 500 })
  }
}
