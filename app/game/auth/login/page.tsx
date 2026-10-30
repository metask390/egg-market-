import LayingChicken from '@/components/game/LayingChicken'
import AuthForm from '@/components/game/AuthForm'

export default function LoginPage() {
  return <main className="reference-auth"><section className="reference-hero"><LayingChicken /><div className="hero-logo"><span>🐔</span><div><strong>Egg Market</strong><small>Chicken Farm</small></div></div><div className="hero-copy"><span>Fresh Eggs</span><strong>Better Tomorrow</strong></div></section><section className="auth-sheet"><span className="leaf leaf-left">🌿</span><span className="leaf leaf-right">🌿</span><AuthForm mode="login" /></section></main>
}
