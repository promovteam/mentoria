export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return null
  return session
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { theme, description, context, references, category } = await req.json()
  if (!theme || !description) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const idea = await prisma.contentIdea.create({ data: { theme, description, context, references, category } })
  return NextResponse.json({ idea })
}
