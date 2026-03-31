import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import IdeiasClient from './IdeiasClient'

export default async function IdeiasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const ideas = await prisma.contentIdea.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mochila de Ideias</h1>
        <p className="text-[#888888] mt-1">Banco de ideias de conteúdo cristão para o seu nicho</p>
      </div>
      <IdeiasClient ideas={ideas} />
    </div>
  )
}
