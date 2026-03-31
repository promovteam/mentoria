import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, level: true, role: true, avatar: true, niche: true }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
