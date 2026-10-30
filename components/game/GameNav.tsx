'use client'

import Link from 'next/link'
import { Home, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PRIMARY_ADMIN_EMAIL } from '@/lib/adminConstants'

const tabs = [
  { href: '/game/market', label: 'Market', urdu: 'مارکیٹ', Icon: ShoppingBag },
  { href: '/game/dashboard', label: 'My Farm', urdu: 'میرا فارم', Icon: Home },
  { href: '/game/profile', label: 'Profile', urdu: 'پروفائل', Icon: UserRound },
]

export default function GameNav() {
  const pathname = usePathname(); const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setIsAdmin(data.user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL)) }, [])
  const visibleTabs = isAdmin ? [...tabs, { href: '/game/admin', label: 'Admin', urdu: 'ایڈمن', Icon: ShieldCheck }] : tabs
  return <nav className="game-nav" aria-label="Game navigation">{visibleTabs.map(({ href, label, urdu, Icon }) => {
    const active = pathname === href
    return <Link className={active ? 'game-nav-item active' : 'game-nav-item'} href={href} key={href}><Icon size={21} strokeWidth={active ? 2.5 : 1.8} /><span>{label}</span><small>{urdu}</small></Link>
  })}</nav>
}
