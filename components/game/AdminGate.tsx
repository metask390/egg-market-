'use client'

import Link from 'next/link'
import { BarChart3, ChevronRight, FileCheck2, LogOut, Settings, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PRIMARY_ADMIN_EMAIL } from '@/lib/adminConstants'

const links = [{ href: '/game/admin', label: 'Overview', Icon: BarChart3 }, { href: '/game/admin/deposits', label: 'Deposits', Icon: FileCheck2 }, { href: '/game/admin/withdrawals', label: 'Withdrawals', Icon: WalletCards }, { href: '/game/admin/users', label: 'Users', Icon: Users }, { href: '/game/admin/settings', label: 'Payment settings', Icon: Settings }]
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [allowed, setAllowed] = useState<boolean | null>(null); const [email, setEmail] = useState('')
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); const ok = user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL; if (!ok) router.replace('/game/dashboard'); else { setEmail(user?.email || ''); setAllowed(true) } })() }, [router])
  async function logout() { await supabase.auth.signOut(); router.replace('/game/auth/login') }
  if (allowed !== true) return <main className="admin-loading">Checking admin access…</main>
  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/game/admin" className="admin-logo"><span className="brand-mark">🐣</span><span>Egg Market<br /><small>ADMIN CONSOLE</small></span></Link><nav>{links.map(({ href, label, Icon }) => <Link className={pathname === href ? 'admin-link active' : 'admin-link'} href={href} key={href}><Icon size={17} />{label}<ChevronRight size={14} /></Link>)}</nav><div className="admin-account"><ShieldCheck size={16} /><span>{email}</span><button onClick={logout} aria-label="Log out"><LogOut size={15} /></button></div></aside><section className="admin-main"><div className="admin-mobile-header"><Link href="/game/admin" className="game-brand"><span className="brand-mark">🐣</span> Egg Market Admin</Link></div>{children}</section></main>
}
