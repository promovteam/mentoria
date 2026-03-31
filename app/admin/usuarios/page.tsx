import { prisma } from '@/lib/prisma'
import UsuariosClient from './UsuariosClient'

export default async function AdminUsuarios() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, niche: true,
      followers: true, points: true, level: true, role: true,
      _count: { select: { posts: true, kanbanCards: true } },
    },
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">Painel Admin</p>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-[#888] mt-1 text-sm">{users.length} usuários cadastrados</p>
      </div>
      <UsuariosClient users={users} />
    </div>
  )
}
