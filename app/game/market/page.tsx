import GameShell from '@/components/game/GameShell'
import MarketClient from '@/components/game/MarketClient'

export default function MarketPage() {
  return <GameShell title="Chicken Market" eyebrow="BUILD YOUR FLOCK · اپنا فارم بنائیں"><p className="page-intro">Choose a happy layer for your farm. Every chicken brings fresh daily egg value.</p><MarketClient /></GameShell>
}
