import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Egg Market | Chicken Farm', description: 'A premium 3D play-to-earn chicken farm.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
