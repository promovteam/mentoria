import { prisma } from '@/lib/prisma'
import IdeiasAdminClient from './IdeiasAdminClient'

export default async function AdminIdeias() {
  const ideas = await prisma.contentIdea.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">Painel Admin</p>
        <h1 className="text-2xl font-bold text-white">Ideias de Conteúdo</h1>
        <p className="text-[#888] mt-1 text-sm">{ideas.length} ideias cadastradas</p>
      </div>
      <IdeiasAdminClient ideas={ideas} />
    </div>
  )
}
