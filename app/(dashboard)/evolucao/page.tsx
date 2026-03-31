import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const LEVELS = [
  { name: 'Iniciante', minPoints: 0, maxPoints: 50, color: 'from-gray-600 to-gray-700', textColor: 'text-gray-300', description: 'Dando os primeiros passos na jornada', emoji: '🌱' },
  { name: 'Produtor', minPoints: 50, maxPoints: 150, color: 'from-blue-600 to-blue-700', textColor: 'text-blue-300', description: 'Produzindo conteúdo com consistência', emoji: '🎬' },
  { name: 'Consistente', minPoints: 150, maxPoints: 300, color: 'from-green-600 to-green-700', textColor: 'text-green-300', description: 'Referência em consistência na criação', emoji: '⭐' },
  { name: 'Influenciador', minPoints: 300, maxPoints: 500, color: 'from-violet-600 to-violet-700', textColor: 'text-violet-300', description: 'Influenciando vidas para o Reino', emoji: '🌟' },
  { name: 'Autoridade', minPoints: 500, maxPoints: Infinity, color: 'from-amber-500 to-amber-700', textColor: 'text-amber-300', description: 'Autoridade cristã no mundo digital', emoji: '👑' },
]

const BADGES = [
  { id: 'first-post', name: 'Primeiro Post', emoji: '📝', description: 'Publicou na comunidade', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => u.postsThisMonth > 0 },
  { id: 'task-master', name: 'Dedicado', emoji: '✅', description: 'Completou 3+ tarefas', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => (u._count?.tasks ?? 0) >= 3 },
  { id: 'influencer', name: 'Influência', emoji: '👥', description: 'Mais de 1k seguidores', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => u.followers >= 1000 },
  { id: 'growing', name: 'Em Crescimento', emoji: '📈', description: 'Cresceu mais de 10%', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => u.followers > u.followersLast && u.followersLast > 0 && ((u.followers - u.followersLast) / u.followersLast) >= 0.1 },
  { id: 'creator', name: 'Criador', emoji: '🎨', description: 'Completou alguma tarefa', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => (u._count?.tasks ?? 0) >= 1 },
  { id: 'connected', name: 'Conectado', emoji: '🤝', description: 'Fez parte da comunidade', condition: (u: { postsThisMonth: number; followers: number; followersLast: number; _count?: { tasks: number } }) => u.postsThisMonth >= 0 },
]

export default async function EvolucaoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      _count: { select: { tasks: true, posts: true } },
    }
  })
  if (!user) redirect('/login')

  const currentLevelData = LEVELS.find(l => l.name === user.level) || LEVELS[0]
  const currentLevelIndex = LEVELS.findIndex(l => l.name === user.level)
  const nextLevel = LEVELS[currentLevelIndex + 1]

  const pointsInCurrentLevel = user.points - currentLevelData.minPoints
  const pointsNeeded = nextLevel ? nextLevel.minPoints - currentLevelData.minPoints : 1
  const levelProgress = nextLevel ? Math.min(100, Math.round((pointsInCurrentLevel / pointsNeeded) * 100)) : 100

  const growthPercent = user.followersLast > 0
    ? Math.round(((user.followers - user.followersLast) / user.followersLast) * 100)
    : 0

  const earnedBadges = BADGES.filter(b => b.condition({
    ...user,
    _count: { tasks: user._count.tasks }
  }))

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Minha Evolução</h1>
        <p className="text-[#888888] mt-1">Acompanhe seu crescimento como criador cristão</p>
      </div>

      {/* Current level */}
      <div className={`bg-gradient-to-r ${currentLevelData.color} rounded-2xl p-6 mb-6 relative overflow-hidden`}>
        <div className="absolute -top-4 -right-4 text-8xl opacity-20">{currentLevelData.emoji}</div>
        <div className="relative z-10">
          <p className="text-sm text-white/70 mb-1">Nível atual</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{currentLevelData.emoji}</span>
            <h2 className="text-3xl font-bold text-white">{user.level}</h2>
          </div>
          <p className="text-white/80 text-sm">{currentLevelData.description}</p>

          {nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{pointsInCurrentLevel} / {pointsNeeded} pts para {nextLevel.name}</span>
                <span>{levelProgress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          )}

          {!nextLevel && (
            <p className="mt-3 text-white/80 text-sm font-medium">🏆 Nível máximo atingido!</p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">{user.points}</p>
          <p className="text-xs text-[#888] mt-1">Pontos totais</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{user.followers.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#888] mt-1">Seguidores</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growthPercent >= 0 ? '+' : ''}{growthPercent}%
          </p>
          <p className="text-xs text-[#888] mt-1">Crescimento</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{user.postsThisMonth}</p>
          <p className="text-xs text-[#888] mt-1">Posts/Mês</p>
        </div>
      </div>

      {/* Level progression */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-5">Jornada de Níveis</h3>
        <div className="space-y-3">
          {LEVELS.map((level, i) => {
            const isCurrent = level.name === user.level
            const isPast = LEVELS.findIndex(l => l.name === user.level) > i
            return (
              <div key={level.name} className={`flex items-center gap-3 p-3 rounded-xl ${isCurrent ? 'bg-violet-600/10 border border-violet-500/20' : ''}`}>
                <span className={`text-xl ${isPast || isCurrent ? '' : 'opacity-30'}`}>{level.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-white' : isPast ? 'text-[#888]' : 'text-[#444]'}`}>
                      {level.name}
                    </p>
                    {isCurrent && (
                      <span className="text-xs bg-violet-600 text-white px-1.5 py-0.5 rounded-full">atual</span>
                    )}
                    {isPast && (
                      <span className="text-xs text-green-400">✓</span>
                    )}
                  </div>
                  <p className={`text-xs ${isPast || isCurrent ? 'text-[#888]' : 'text-[#444]'}`}>
                    {level.maxPoints === Infinity ? `${level.minPoints}+ pts` : `${level.minPoints}–${level.maxPoints} pts`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
        <h3 className="font-semibold text-white mb-5">Conquistas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map(badge => {
            const earned = earnedBadges.some(b => b.id === badge.id)
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  earned
                    ? 'bg-violet-600/10 border-violet-500/30'
                    : 'border-[#1a1a1a] opacity-40'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <p className={`text-sm font-medium mt-2 ${earned ? 'text-white' : 'text-[#666]'}`}>{badge.name}</p>
                <p className="text-xs text-[#888] mt-0.5">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
