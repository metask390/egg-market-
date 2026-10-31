'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Coins, Egg, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FarmScene from '@/components/game/FarmScene'

type UserRow = Record<string, any>; type ChickenRow = Record<string, any>; type TypeRow = Record<string, any>

export default function FarmClient() {
  const [user, setUser] = useState<UserRow | null>(null); const [profileMissing, setProfileMissing] = useState(false); const [chickens, setChickens] = useState<ChickenRow[]>([]); const [types, setTypes] = useState<Record<string, TypeRow>>({})
  const [loading, setLoading] = useState(true); const [collecting, setCollecting] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function load() {
    setLoading(true); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { setError('Please log in to view your farm.'); setLoading(false); return }
    const [{ data: userData, error: userError }, { data: owned, error: chickenError }, { data: typeData }] = await Promise.all([
      supabase.from('game_users').select('*').eq('user_id', auth.user.id).maybeSingle(), supabase.from('game_user_chickens').select('*').eq('user_id', auth.user.id), supabase.from('game_chicken_types').select('*')
    ])
    if (userError) setError(userError.message); if (chickenError) setError(chickenError.message); if (!userData) setProfileMissing(true); setUser(userData || { user_id: auth.user.id, wallet_balance: 0 }); setChickens(owned || []); setTypes(Object.fromEntries((typeData || []).map((item: TypeRow) => [item.id, item]))); setLoading(false)
  }
  useEffect(() => { load() }, [])
  const balance = Number(user?.wallet_balance ?? user?.wallet ?? 0); const enriched: Array<ChickenRow & { type: TypeRow }> = useMemo(() => chickens.map(chicken => ({ ...chicken, type: types[chicken.chicken_type_id] || {} })), [chickens, types])
  const available = enriched.filter(chicken => !chicken.last_collected_at || Date.now() - new Date(chicken.last_collected_at).getTime() >= 86400000)
  const reward = available.reduce((sum, chicken) => sum + Number(chicken.type.egg_value ?? chicken.egg_value ?? 0), 0)
  async function collect() {
    if (!user || !available.length || collecting) return; setCollecting(true); setError(''); setMessage('')
    try {
      const now = new Date().toISOString(); const amount = reward
      const updates = await Promise.all(available.map(chicken => supabase.from('game_user_chickens').update({ last_collected_at: now }).eq('id', chicken.id)))
      const failed = updates.find(result => result.error); if (failed?.error) throw failed.error
      const { error: walletError } = await supabase.from('game_users').update({ wallet_balance: balance + amount }).eq('user_id', user.user_id); if (walletError) throw walletError
      setUser({ ...user, wallet_balance: balance + amount }); setChickens(chickens.map(chicken => available.some(item => item.id === chicken.id) ? { ...chicken, last_collected_at: now } : chicken)); setMessage(`+${amount.toLocaleString()} Rs added to your wallet. Keep growing!`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Collection failed') } finally { setCollecting(false) }
  }
  if (loading) return <div className="empty-state">Loading your farm…</div>
  return <>
    {profileMissing && <div className="empty-state compact">Please wait while we set up your farm...</div>}{error && <div className="error game-notice">{error}</div>}{message && <div className="success game-notice"><Sparkles size={17} />{message}</div>}
    <section className="farm-wallet"><div><span>AVAILABLE BALANCE</span><strong>{balance.toLocaleString()} <small>Rs</small></strong><p>Growing with every egg</p></div><div className="wallet-orb"><Coins /></div></section>
    <FarmScene count={enriched.length} eggReady={available.length > 0} />
    <section className="collection-card"><div className="collection-head"><div><p className="card-kicker">DAILY HARVEST · روزانہ آمدن</p><h2>Egg collection</h2></div><div className="egg-count"><Egg size={18} />{enriched.length} <small>chickens</small></div></div><p className="collection-copy">{available.length ? `${available.length} chicken${available.length === 1 ? '' : 's'} have fresh eggs ready.` : 'Your chickens are resting. Come back after 24 hours.'}</p><button className="collect-btn" disabled={!available.length || !reward || collecting} onClick={collect}><Egg size={19} />{collecting ? 'Collecting…' : available.length ? `Collect Eggs (${reward.toLocaleString()} Rs)` : 'Eggs collected for today'}</button></section>
    {!enriched.length && <div className="empty-state compact">No chickens yet. <a href="/game/market">Visit Market →</a></div>}
  </>
}
