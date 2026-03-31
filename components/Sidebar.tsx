'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Layout,
  CheckSquare,
  Play,
  Lightbulb,
  BookOpen,
  Users,
  MessageCircle,
  Trophy,
  Bot,
  TrendingUp,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/kanban', label: 'Kanban', icon: Layout },
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/aulas', label: 'Aulas', icon: Play },
  { href: '/ideias', label: 'Mochila de Ideias', icon: Lightbulb },
  { href: '/formatos', label: 'Formatos', icon: BookOpen },
  { href: '/criadores', label: 'Criadores', icon: Users },
  { href: '/comunidade', label: 'Comunidade', icon: MessageCircle },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/ia', label: 'Assistente IA', icon: Bot },
  { href: '/evolucao', label: 'Minha Evolução', icon: TrendingUp },
]

interface SidebarProps {
  user?: {
    name: string
    email: string
    level: string
    role?: string
    avatar?: string | null
    niche?: string | null
  }
}

const levelColors: Record<string, string> = {
  'Iniciante': 'bg-gray-700 text-gray-300',
  'Produtor': 'bg-blue-900/50 text-blue-300',
  'Consistente': 'bg-green-900/50 text-green-300',
  'Influenciador': 'bg-violet-900/50 text-violet-300',
  'Autoridade': 'bg-amber-900/50 text-amber-300',
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2v8M8 6h8M5 10h14l-1.5 10h-11L5 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Mentoria</p>
            <p className="text-xs text-[#888] leading-none mt-0.5">Criadores Cristãos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                    active
                      ? 'bg-violet-600/15 text-violet-400 font-medium'
                      : 'text-[#888888] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon
                    size={17}
                    className={active ? 'text-violet-400' : 'text-[#666] group-hover:text-[#aaa]'}
                  />
                  {label}
                  {href === '/ia' && (
                    <span className="ml-auto text-xs bg-violet-600/20 text-violet-400 px-1.5 py-0.5 rounded">
                      IA
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-[#1f1f1f] p-4">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${levelColors[user.level] || levelColors['Iniciante']}`}>
                {user.level}
              </span>
            </div>
          </div>
        )}

        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-600/10 rounded-lg transition-all duration-150 mb-1"
          >
            <ShieldCheck size={15} />
            Painel Admin
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#888888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
