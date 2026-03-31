import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import KanbanBoard from './KanbanBoard'

export default async function KanbanPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Kanban de Conteúdo</h1>
        <p className="text-[#888888] mt-1">Gerencie suas ideias do conceito à publicação</p>
      </div>
      <KanbanBoard />
    </div>
  )
}
