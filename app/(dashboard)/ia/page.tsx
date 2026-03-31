import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import IAChat from './IAChat'

export default async function IAPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, avatarMapping: { select: { id: true } } },
  })

  const firstName = user?.name?.split(' ')[0] || 'Criador'
  const hasAvatarMapping = !!user?.avatarMapping

  return <IAChat firstName={firstName} hasAvatarMapping={hasAvatarMapping} />
}
