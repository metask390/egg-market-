import LayingChicken from '@/components/game/LayingChicken'
import AuthForm from '@/components/game/AuthForm'

export default function RegisterPage() {
  return <main className="auth-shell"><div className="auth-page"><div className="brand"><span className="brand-mark">🐣</span> Egg Market</div><div className="scene-card"><span className="scene-label">Your farm · Live</span><LayingChicken /></div><AuthForm mode="register" /></div></main>
}
