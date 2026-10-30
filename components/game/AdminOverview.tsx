'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock3, Coins, Users, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminClient'

type Stats = { users: number; pendingDeposits: number; pendingWithdrawals: number; revenue: number }
export default function AdminOverview() { const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState(''); useEffect(() => { adminFetch('/api/admin').then(setStats).catch(err => setError(err.message)) }, [])
  return <><div className="admin-title"><div><p>CONTROL CENTER</p><h1>Good morning, admin.</h1></div><span className="admin-status"><span /> System live</span></div>{error && <div className="error admin-alert">{error}</div>}<div className="admin-stats"><div><span><Users size={16} />Total users</span><strong>{stats?.users ?? '—'}</strong><small>registered farmers</small></div><div><span><Clock3 size={16} />Pending deposits</span><strong>{stats?.pendingDeposits ?? '—'}</strong><small>need approval</small></div><div><span><WalletCards size={16} />Pending withdrawals</span><strong>{stats?.pendingWithdrawals ?? '—'}</strong><small>need processing</small></div><div><span><Coins size={16} />Total revenue</span><strong>{stats ? `${stats.revenue.toLocaleString()} Rs` : '—'}</strong><small>approved deposits</small></div></div><section className="admin-quick"><div><p className="card-kicker">WORK QUEUE</p><h2>Keep the farm moving</h2><p>Review payments, release chickens, and process withdrawals from one place.</p></div><div className="quick-links"><Link href="/game/admin/deposits">Review deposits <ArrowUpRight size={16} /></Link><Link href="/game/admin/withdrawals">Process withdrawals <ArrowUpRight size={16} /></Link><Link href="/game/admin/settings">Update payment details <ArrowUpRight size={16} /></Link></div></section></>
}
