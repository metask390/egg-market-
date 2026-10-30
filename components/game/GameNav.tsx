'use client'

import Link from 'next/link'
import { Home, ShoppingBag, UserRound } from 'lucide-react'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/game/market', label: 'Market', urdu: 'مارکیٹ', Icon: ShoppingBag },
  { href: '/game/dashboard', label: 'My Farm', urdu: 'میرا فارم', Icon: Home },
  { href: '/game/profile', label: 'Profile', urdu: 'پروفائل', Icon: UserRound },
]

export default function GameNav() {
  const pathname = usePathname()
  return <nav className="game-nav" aria-label="Game navigation">{tabs.map(({ href, label, urdu, Icon }) => {
    const active = pathname === href
    return <Link className={active ? 'game-nav-item active' : 'game-nav-item'} href={href} key={href}><Icon size={21} strokeWidth={active ? 2.5 : 1.8} /><span>{label}</span><small>{urdu}</small></Link>
  })}</nav>
}
