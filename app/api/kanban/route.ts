import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const cards = await prisma.kanbanCard.findMany({
      where: { userId: session.userId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      orderBy: [{ column: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Kanban GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { title, description, column } = await req.json()
    if (!title) {
      return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
    }

    const lastCard = await prisma.kanbanCard.findFirst({
      where: { userId: session.userId, column: column || 'ideias' },
      orderBy: { order: 'desc' },
    })

    const card = await prisma.kanbanCard.create({
      data: {
        title,
        description: description || null,
        column: column || 'ideias',
        order: (lastCard?.order ?? -1) + 1,
        userId: session.userId,
      },
      include: { comments: true },
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error('Kanban POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
