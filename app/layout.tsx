import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Semaforo — Sanidad de Granjas',
  description: 'Control sanitario visual de granjas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
