import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
