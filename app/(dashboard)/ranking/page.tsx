import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const levelColors: Record<string, string> = {
  'Iniciante': 'text-gray-400 bg-gray-900/50',
  'Produtor': 'text-blue-400 bg-blue-900/30',
  'Consistente': 'text-green-400 bg-green-900/30',
  'Influenciador': 'text-violet-400 bg-violet-900/30',
  'Autoridade': 'text-amber-400 bg-amber-900/30',
}

export default async function RankingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const users = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    select: {
      id: true,
      name: true,
      niche: true,
      avatar: true,
      followers: true,
      followersLast: true,
      postsThisMonth: true,
      points: true,
      level: true,
      _count: { select: { tasks: true } }
    }
  })

  const usersWithGrowth = users.map(u => ({
    ...u,
    growthPercent: u.followersLast > 0
      ? Math.round(((u.followers - u.followersLast) / u.followersLast) * 100)
      : 0,
  }))

  const myRank = usersWithGrowth.findIndex(u => u.id === session.userId) + 1

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Ranking</h1>
        <p className="text-[#888888] mt-1">Os criadores cristãos mais engajados da plataforma</p>
      </div>

      {/* My position */}
      {myRank > 0 && (
        <div className="bg-violet-600/10 border border-violet-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-violet-300">Sua posição no ranking</p>
          <span className="text-2xl font-bold text-violet-400">#{myRank}</span>
        </div>
      )}

      {/* Top 3 podium */}
      {usersWithGrowth.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-2">
              {getInitials(usersWithGrowth[1].name)}
            </div>
            <p className="text-xs text-[#888] text-center truncate w-20">{usersWithGrowth[1].name.split(' ')[0]}</p>
            <div className="bg-[#1a1a1a] border border-gray-500/30 rounded-t-xl px-4 py-3 mt-2 text-center" style={{ height: '80px' }}>
              <span className="text-2xl">🥈</span>
              <p className="text-xs text-gray-400 font-semibold">{usersWithGrowth[1].points} pts</p>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold mb-2 ring-2 ring-amber-400/50">
              {getInitials(usersWithGrowth[0].name)}
            </div>
            <p className="text-xs text-[#888] text-center truncate w-20">{usersWithGrowth[0].name.split(' ')[0]}</p>
            <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-t-xl px-4 py-3 mt-2 text-center" style={{ height: '100px' }}>
              <span className="text-2xl">🥇</span>
              <p className="text-xs text-amber-400 font-semibold">{usersWithGrowth[0].points} pts</p>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-700 to-orange-900 rounded-full flex items-center justify-center text-white font-bold mb-2">
              {getInitials(usersWithGrowth[2].name)}
            </div>
            <p className="text-xs text-[#888] text-center truncate w-20">{usersWithGrowth[2].name.split(' ')[0]}</p>
            <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-t-xl px-4 py-3 mt-2 text-center" style={{ height: '65px' }}>
              <span className="text-2xl">🥉</span>
              <p className="text-xs text-orange-400 font-semibold">{usersWithGrowth[2].points} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="space-y-2">
        {usersWithGrowth.map((user, i) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              user.id === session.userId
                ? 'bg-violet-600/10 border-violet-500/30'
                : 'bg-[#111111] border-[#1f1f1f] hover:border-[#333]'
            }`}
          >
            <span className={`text-sm font-bold w-7 text-center ${
              i === 0 ? 'text-amber-400' :
              i === 1 ? 'text-gray-400' :
              i === 2 ? 'text-orange-500' :
              'text-[#666]'
            }`}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
            </span>

            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {getInitials(user.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                  {user.id === session.userId && <span className="text-violet-400 text-xs ml-1">(você)</span>}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${levelColors[user.level] || levelColors['Iniciante']}`}>
                  {user.level}
                </span>
              </div>
              <p className="text-xs text-[#888]">{user.niche || 'Criador Cristão'}</p>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-[#888]">
              <div className="text-center">
                <p className="text-white font-medium">{user.followers.toLocaleString('pt-BR')}</p>
                <p>seguidores</p>
              </div>
              <div className="text-center">
                <p className={`font-medium ${user.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {user.growthPercent >= 0 ? '+' : ''}{user.growthPercent}%
                </p>
                <p>crescimento</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-violet-400">{user.points}</p>
              <p className="text-xs text-[#888]">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
