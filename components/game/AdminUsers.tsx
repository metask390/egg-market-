'use client'

import { Ban, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminClient'

type User = Record<string, any>
export default function AdminUsers() { const [rows, setRows] = useState<User[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [message, setMessage] = useState('')
  async function load() { setLoading(true); try { setRows(await adminFetch('/api/admin/users')) } catch (err) { setError(err instanceof Error ? err.message : 'Could not load users') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function toggle(user: User) { setError(''); try { await adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify({ id: user.user_id, is_blocked: !user.is_blocked }) }); setMessage(user.is_blocked ? 'User unblocked.' : 'User blocked from gameplay.'); setRows(rows.map(row => row.user_id === user.user_id ? { ...row, is_blocked: !user.is_blocked } : row)) } catch (err) { setError(err instanceof Error ? err.message : 'Could not update user') } }
  return <><div className="admin-title"><div><p>FARMER DIRECTORY</p><h1>Users</h1></div><span className="queue-count">{rows.length} registered</span></div>{error && <div className="error admin-alert">{error}</div>}{message && <div className="success admin-alert">{message}</div>}<div className="admin-table-wrap">{loading ? <div className="empty-state">Loading users…</div> : <table className="admin-table"><thead><tr><th>Farmer</th><th>Wallet</th><th>Invested</th><th>Chickens</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(row => <tr key={row.user_id}><td><strong>{row.email || row.username || row.user_id}</strong><small>{row.username || 'No username'}</small></td><td><strong>{Number(row.wallet_balance ?? row.wallet ?? 0).toLocaleString()} Rs</strong></td><td><strong>{Number(row.total_invested || 0).toLocaleString()} Rs</strong></td><td><strong>{row.chicken_count}</strong></td><td><span className={row.is_blocked ? 'status-badge blocked' : 'status-badge'}>{row.is_blocked ? 'Blocked' : 'Active'}</span></td><td><button className={row.is_blocked ? 'unblock-btn' : 'block-btn'} onClick={() => toggle(row)}>{row.is_blocked ? <><CheckCircle2 size={14} />Unblock</> : <><Ban size={14} />Block</>}</button></td></tr>)}</tbody></table>}</div></>
}
