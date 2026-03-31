import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AulasClient from './AulasClient'

export default async function AulasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          completions: { where: { userId: session.userId } },
          downloads: true,
        }
      }
    }
  })

  const modulesWithProgress = modules.map(m => ({
    ...m,
    lessons: m.lessons.map(l => ({
      ...l,
      completed: l.completions.length > 0,
    })),
    completedCount: m.lessons.filter(l => l.completions.length > 0).length,
  }))

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Aulas</h1>
        <p className="text-[#888888] mt-1">Aprenda e evolua como criador cristão</p>
      </div>
      <AulasClient modules={modulesWithProgress} />
    </div>
  )
}
