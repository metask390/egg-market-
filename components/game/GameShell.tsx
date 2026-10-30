'use client'

import Link from 'next/link'
import GameNav from '@/components/game/GameNav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GameShell({ children, title, eyebrow, balance }: { children: React.ReactNode; title: string; eyebrow?: string; balance?: number }) {
  const [blocked, setBlocked] = useState(false); const [checked, setChecked] = useState(false)
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) { const { data } = await supabase.from('game_users').select('is_blocked').eq('id', user.id).maybeSingle(); setBlocked(Boolean(data?.is_blocked)) } setChecked(true) })() }, [])
  if (!checked) return <main className="game-shell"><div className="empty-state access-loading">Loading your game…</div></main>
  if (blocked) return <main className="game-shell"><div className="blocked-screen"><span>🔒</span><h1>Account restricted</h1><p>Your game access is currently blocked. Please contact the administrator for help.</p><Link href="/game/auth/login">Return to login</Link></div></main>
  return <main className="game-shell"><div className="game-content"><header className="game-header"><Link className="game-brand" href="/game/dashboard"><span className="brand-mark">🐣</span><span>Egg Market</span></Link>{typeof balance === 'number' && <div className="wallet-pill"><span>Wallet</span><strong>{balance.toLocaleString()} Rs</strong></div>}</header><section className="page-heading">{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1></section>{children}</div><GameNav /></main>
}
