import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CriadoresClient from './CriadoresClient'

export default async function CriadoresPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const creators = await prisma.creator.findMany()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Biblioteca de Criadores</h1>
        <p className="text-[#888888] mt-1">Conheça criadores cristãos de referência em cada nicho</p>
      </div>
      <CriadoresClient creators={creators} />
    </div>
  )
}
