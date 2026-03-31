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
  const { theme, description, context, references, category } = await req.json()
  const idea = await prisma.contentIdea.update({
    where: { id: params.id },
    data: { theme, description, context, references, category },
  })
  return NextResponse.json({ idea })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.contentIdea.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
