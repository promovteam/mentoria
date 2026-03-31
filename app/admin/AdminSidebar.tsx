'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Lightbulb, ArrowLeft } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/ideias', label: 'Ideias de Conteúdo', icon: Lightbulb },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2v8M8 6h8M5 10h14l-1.5 10h-11L5 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Admin</p>
            <p className="text-xs text-violet-400 leading-none mt-0.5">Painel de Controle</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                active
                  ? 'bg-violet-600/15 text-violet-400 font-medium'
                  : 'text-[#888] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon size={16} className={active ? 'text-violet-400' : 'text-[#666] group-hover:text-[#aaa]'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1f1f1f]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-all duration-150"
        >
          <ArrowLeft size={15} className="text-[#666]" />
          Voltar à plataforma
        </Link>
      </div>
    </aside>
  )
}
