import './globals.css'
import type { Metadata } from 'next'
import { Orbitron } from 'next/font/google'
import LcarsShellGrid from '@/components/lcars/LcarsShellGrid'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'LCARS Observation Lounge',
  description: 'Mission control for starship operations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-lcars-black text-lcars-peach`}>
        <LcarsShellGrid>{children}</LcarsShellGrid>
      </body>
    </html>
  )
}
