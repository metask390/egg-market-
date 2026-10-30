'use client'

import Link from 'next/link'
import GameNav from '@/components/game/GameNav'

export default function GameShell({ children, title, eyebrow, balance }: { children: React.ReactNode; title: string; eyebrow?: string; balance?: number }) {
  return <main className="game-shell"><div className="game-content"><header className="game-header"><Link className="game-brand" href="/game/dashboard"><span className="brand-mark">🐣</span><span>Egg Market</span></Link>{typeof balance === 'number' && <div className="wallet-pill"><span>Wallet</span><strong>{balance.toLocaleString()} Rs</strong></div>}</header><section className="page-heading">{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1></section>{children}</div><GameNav /></main>
}
