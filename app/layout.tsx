import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mentoria Criadores Cristãos',
  description: 'Plataforma de mentoria para criadores de conteúdo cristãos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0a0a0a] text-[#e5e5e5] min-h-screen">
        {children}
      </body>
    </html>
  )
}
