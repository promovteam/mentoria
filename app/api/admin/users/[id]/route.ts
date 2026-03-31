import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return null
  return session
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { role } = await req.json()
  const user = await prisma.user.update({ where: { id: params.id }, data: { role } })
  return NextResponse.json({ user })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // Don't allow deleting admins
  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user || user.role === 'admin') return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 })
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
