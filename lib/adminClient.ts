import { supabase } from '@/lib/supabase'

export async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(options.headers); if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`); if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(path, { ...options, headers }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || 'Admin request failed'); return body
}
