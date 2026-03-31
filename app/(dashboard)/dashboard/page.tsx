import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import UpdateFollowersModal from './UpdateFollowersModal'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tasks: { include: { task: true } },
    }
  })
  if (!user) redirect('/login')

  const topUsers = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: 5,
    select: { id: true, name: true, niche: true, points: true, level: true, avatar: true, followers: true }
  })

  const recentTasks = await prisma.task.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      userTasks: { where: { userId: session.userId } }
    }
  })

  const growthPercent = user.followersLast > 0
    ? Math.round(((user.followers - user.followersLast) / user.followersLast) * 100)
    : 0

  const completedTasks = user.tasks.filter(t => t.completed).length

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const medals = ['🥇', '🥈', '🥉', '4°', '5°']

  return (
    <div className="p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Olá, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#888888] mt-1">
          Bem-vindo à sua plataforma de mentoria. Continue crescendo!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-2">Seguidores</p>
          <p className="text-2xl font-bold text-white">{user.followers.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#666] mt-1">no Instagram</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-2">Crescimento</p>
          <p className={`text-2xl font-bold ${growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growthPercent >= 0 ? '+' : ''}{growthPercent}%
          </p>
          <p className="text-xs text-[#666] mt-1">este período</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-2">Posts/Mês</p>
          <p className="text-2xl font-bold text-white">{user.postsThisMonth}</p>
          <p className="text-xs text-[#666] mt-1">publicações</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-2">Pontos</p>
          <p className="text-2xl font-bold text-violet-400">{user.points}</p>
          <p className="text-xs text-[#666] mt-1">{user.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Ranking da Comunidade</h2>
            <Link href="/ranking" className="text-xs text-violet-400 hover:text-violet-300">Ver tudo</Link>
          </div>
          <div className="space-y-3">
            {topUsers.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  u.id === session.userId ? 'bg-violet-600/10 border border-violet-500/20' : 'hover:bg-[#1a1a1a]'
                } transition-colors`}
              >
                <span className="text-lg w-7 text-center">{medals[i]}</span>
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {getInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {u.name}
                    {u.id === session.userId && <span className="text-violet-400 text-xs ml-1">(você)</span>}
                  </p>
                  <p className="text-xs text-[#888]">{u.niche || 'Criador Cristão'}</p>
                </div>
                <span className="text-sm font-semibold text-violet-400">{u.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Update followers */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3">Atualizar Seguidores</h3>
            <p className="text-sm text-[#888888] mb-4">
              Mantenha seu crescimento atualizado para o ranking!
            </p>
            <UpdateFollowersModal userId={session.userId} currentFollowers={user.followers} />
          </div>

          {/* Recent tasks */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Tarefas Recentes</h3>
              <Link href="/tarefas" className="text-xs text-violet-400 hover:text-violet-300">Ver todas</Link>
            </div>
            <div className="space-y-2">
              {recentTasks.map(task => {
                const done = task.userTasks.length > 0 && task.userTasks[0].completed
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${done ? 'bg-green-500' : 'border-2 border-[#333]'}`} />
                    <p className={`text-sm truncate ${done ? 'text-[#666] line-through' : 'text-[#e5e5e5]'}`}>
                      {task.title}
                    </p>
                    <span className="ml-auto text-xs text-violet-400 flex-shrink-0">+{task.points}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-[#888] mt-4">
              {completedTasks} de {user.tasks.length + recentTasks.length} concluídas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
