import { prisma } from '@/lib/prisma'
import { Users, BookOpen, MessageSquare, Lightbulb } from 'lucide-react'

export default async function AdminDashboard() {
  const [userCount, postCount, lessonCount, ideaCount, topUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'user' } }),
    prisma.post.count(),
    prisma.lesson.count(),
    prisma.contentIdea.count(),
    prisma.user.findMany({
      where: { role: 'user' },
      orderBy: { points: 'desc' },
      take: 5,
      select: { id: true, name: true, niche: true, points: true, level: true, followers: true },
    }),
  ])

  const stats = [
    { label: 'Mentorados', value: userCount, icon: Users, color: 'from-violet-600 to-violet-800', glow: 'shadow-violet-500/20' },
    { label: 'Posts na Comunidade', value: postCount, icon: MessageSquare, color: 'from-blue-600 to-blue-800', glow: 'shadow-blue-500/20' },
    { label: 'Aulas Publicadas', value: lessonCount, icon: BookOpen, color: 'from-green-600 to-green-800', glow: 'shadow-green-500/20' },
    { label: 'Ideias de Conteúdo', value: ideaCount, icon: Lightbulb, color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/20' },
  ]

  const levelColors: Record<string, string> = {
    'Iniciante': 'bg-[#1a1a1a] text-[#888]',
    'Produtor': 'bg-blue-900/40 text-blue-300',
    'Consistente': 'bg-green-900/40 text-green-300',
    'Influenciador': 'bg-violet-900/40 text-violet-300',
    'Autoridade': 'bg-amber-900/40 text-amber-300',
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">Painel Admin</p>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-[#888] mt-1 text-sm">Métricas gerais da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2a2a2a] transition-all">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg ${glow} mb-4`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-[#666] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top users */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Top Mentorados por Pontos</h2>
          <span className="text-xs text-[#666]">Top 5</span>
        </div>
        <div className="divide-y divide-[#141414]">
          {topUsers.map((u, i) => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141414] transition-colors">
              <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-[#aaa]' : i === 2 ? 'text-amber-600' : 'text-[#555]'}`}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{u.name}</p>
                <p className="text-xs text-[#666]">{u.niche || '—'}</p>
              </div>
              <span className="text-xs text-[#666]">{u.followers.toLocaleString()} seg.</span>
              <span className={`text-xs px-2 py-1 rounded-lg ${levelColors[u.level] || levelColors['Iniciante']}`}>{u.level}</span>
              <span className="text-sm font-semibold text-violet-400 min-w-[50px] text-right">{u.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
