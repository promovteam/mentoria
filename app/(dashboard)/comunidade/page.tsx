import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ComunidadeClient from './ComunidadeClient'

export default async function ComunidadePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Comunidade</h1>
        <p className="text-[#888888] mt-1">Compartilhe, conecte e inspire outros criadores cristãos</p>
      </div>
      <ComunidadeClient />
    </div>
  )
}
