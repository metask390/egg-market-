'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Check, Egg, ShoppingBag, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Chicken = { id: string; name?: string; chicken_name?: string; price?: number; price_rs?: number; egg_value?: number; color?: string; description?: string }

export default function MarketClient() {
  const [chickens, setChickens] = useState<Chicken[]>([]); const [selected, setSelected] = useState<Chicken | null>(null); const [quantity, setQuantity] = useState(1)
  const [transactionId, setTransactionId] = useState(''); const [senderName, setSenderName] = useState(''); const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false); const [notice, setNotice] = useState(''); const [error, setError] = useState('')
  useEffect(() => { supabase.from('game_chicken_types').select('*').order('price', { ascending: true }).then(({ data, error }) => { if (error) setError(error.message); else setChickens((data || []) as Chicken[]); setLoading(false) }) }, [])
  const total = useMemo(() => (selected?.price ?? selected?.price_rs ?? 0) * quantity, [selected, quantity])
  function open(chicken: Chicken) { setSelected(chicken); setQuantity(1); setNotice(''); setError('') }
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!selected) return; setSubmitting(true); setError(''); setNotice('')
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Please log in first / پہلے لاگ ان کریں')
      let screenshotUrl = ''
      if (file) { const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`; const upload = await supabase.storage.from('game-media').upload(path, file); if (upload.error) throw upload.error; screenshotUrl = supabase.storage.from('game-media').getPublicUrl(path).data.publicUrl }
      const { error: insertError } = await supabase.from('game_deposits').insert({ user_id: user.id, chicken_type_id: selected.id, quantity, amount: total, transaction_id: transactionId, sender_name: senderName, screenshot_url: screenshotUrl, status: 'pending' })
      if (insertError) throw insertError
      setNotice('آپ کی درخواست ایڈمن کو بھیج دی گئی ہے، اپروول کے بعد مرغی آپ کے فارم میں آ جائے گی'); setTransactionId(''); setSenderName(''); setFile(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not submit request') } finally { setSubmitting(false) }
  }
  return <>
    {notice && <div className="success game-notice"><Check size={17} />{notice}</div>}
    {loading && <div className="empty-state">Loading your chicken collection…</div>}
    {!loading && !chickens.length && <div className="empty-state">No chickens are available yet. Admin can add them in Supabase.</div>}
    <div className="chicken-grid">{chickens.map((chicken, index) => { const name = chicken.name || chicken.chicken_name || `Golden Chicken ${index + 1}`; const price = chicken.price ?? chicken.price_rs ?? 0; return <article className="chicken-card" key={chicken.id}><div className="chicken-visual" style={{ background: chicken.color || (index % 2 ? '#fff0bf' : '#e7f2df') }}><span className="chicken-emoji">🐔</span><span className="rarity">FARM FAVOURITE</span></div><div className="chicken-info"><h2>{name}</h2><p>{chicken.description || 'A cheerful daily layer for your farm.'}</p><div className="chicken-stats"><span><strong>{price.toLocaleString()} Rs</strong><small>price</small></span><span><strong>{chicken.egg_value ?? 5} Rs</strong><small>egg / day</small></span></div><button className="buy-btn" onClick={() => open(chicken)}><ShoppingBag size={17} /> Buy chicken</button></div></article> })}</div>
    {selected && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="purchase-modal"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button><div className="modal-kicker"><Egg size={16} /> PAYMENT REQUEST</div><h2>Bring home {selected.name || selected.chicken_name || 'a chicken'}</h2><p>Send {total.toLocaleString()} Rs to the admin account, then share your payment details below.</p><div className="quantity-row"><label>Quantity</label><input type="number" min="1" max="50" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))} /><strong>{total.toLocaleString()} Rs total</strong></div><div className="payment-box"><small>EasyPaisa / JazzCash</small><strong>03XX-XXXXXXX</strong><span>Admin payment account</span></div><form className="auth-form" onSubmit={submit}><div className="field"><label>TRANSACTION ID</label><input required value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. TXN123456" /></div><div className="field"><label>SENDER NAME</label><input required value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your name" /></div><div className="field"><label>PAYMENT SCREENSHOT (OPTIONAL)</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} /></div>{error && <div className="error">{error}</div>}<button className="submit-btn" disabled={submitting}>{submitting ? 'Sending…' : 'Send for admin approval →'}</button></form></div></div>}
  </>
}
