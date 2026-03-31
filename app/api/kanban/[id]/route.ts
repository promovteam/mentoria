import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const card = await prisma.kanbanCard.findUnique({ where: { id: params.id } })
    if (!card || card.userId !== session.userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const updated = await prisma.kanbanCard.update({
      where: { id: params.id },
      data: {
        title: body.title ?? card.title,
        description: body.description !== undefined ? body.description : card.description,
        column: body.column ?? card.column,
        order: body.order !== undefined ? body.order : card.order,
      },
      include: { comments: true },
    })

    return NextResponse.json({ card: updated })
  } catch (error) {
    console.error('Kanban PUT error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const card = await prisma.kanbanCard.findUnique({ where: { id: params.id } })
    if (!card || card.userId !== session.userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    // Delete comments first
    await prisma.kanbanComment.deleteMany({ where: { cardId: params.id } })
    await prisma.kanbanCard.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Kanban DELETE error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
