'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PRIMARY_ADMIN_EMAIL } from '@/lib/adminConstants'

type Mode = 'login' | 'register'

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter(); const isRegister = mode === 'register'
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [terms, setTerms] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage('')
    if (isRegister && password !== confirm) { setError('Passwords do not match / پاس ورڈ ایک جیسے نہیں ہیں'); return }
    setLoading(true)
    try {
      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) throw authError
        if (data.user) { const username = `farmer_${data.user.id.slice(0, 8)}`; const referredBy = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null; const profile = { id: data.user.id, wallet: 0, email, username, ...(referredBy ? { referred_by: referredBy } : {}) }; const { error: profileError } = await supabase.from('game_users').insert(profile); if (profileError && profileError.code !== '23505') throw profileError }
        setMessage('Account created. Check your email to confirm, then log in. / اکاؤنٹ بن گیا ہے')
      } else {
        const { data: loginData, error: authError } = await supabase.auth.signInWithPassword({ email, password }); if (authError) throw authError
        if (loginData.user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL) await supabase.from('game_users').update({ role: 'admin' }).eq('id', loginData.user.id)
        router.push('/game/dashboard'); router.refresh()
      }
    } catch (err) { setError(err instanceof Error ? `${err.message} / براہ کرم دوبارہ کوشش کریں` : 'Something went wrong / کچھ غلط ہو گیا') } finally { setLoading(false) }
  }
  return <>
    <h1 className="auth-heading">{isRegister ? 'Start your farm.' : 'Welcome back, farmer.'}</h1>
    <p className="auth-subtitle">{isRegister ? 'Create your account and start collecting.' : 'Your chickens missed you. Let’s collect today’s eggs.'}</p>
    <form className="auth-form" onSubmit={submit}>
      <div className="field"><label htmlFor="email">EMAIL ADDRESS</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div className="field"><label htmlFor="password">PASSWORD</label><input id="password" type="password" required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
      {isRegister && <div className="field"><label htmlFor="confirm">CONFIRM PASSWORD</label><input id="confirm" type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" /></div>}
      {error && <div className="error" role="alert">{error}</div>}{message && <div className="success" role="status">{message}</div>}
      <button className="submit-btn" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create my farm →' : 'Enter my farm →'}</button>
    </form>
    <p className="switch">{isRegister ? 'Already have an account?' : 'New to Egg Market?'} {' '}<Link href={isRegister ? '/game/auth/login' : '/game/auth/register'}>{isRegister ? 'Log in' : 'Create account'}</Link></p>
    <p className="description">Buy chickens, collect eggs daily, and earn real money. The ultimate 3D Play-to-Earn farm.</p>
    <button className="terms-link" onClick={() => setTerms(true)}>Terms &amp; Conditions</button>
    {terms && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><h2>Terms &amp; Conditions</h2><p>Egg Market is a game experience. Rewards, balances, and earning features are subject to the rules of the game and applicable verification requirements. Never share your password.</p><button onClick={() => setTerms(false)}>Close</button></div></div>}
  </>
}
