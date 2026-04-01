export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Upsert user task
    const existing = await prisma.userTask.findUnique({
      where: { taskId_userId: { taskId: params.id, userId: session.userId } }
    })

    if (existing?.completed) {
      return NextResponse.json({ message: 'Tarefa já concluída' })
    }

    await prisma.userTask.upsert({
      where: { taskId_userId: { taskId: params.id, userId: session.userId } },
      update: { completed: true, completedAt: new Date() },
      create: {
        taskId: params.id,
        userId: session.userId,
        completed: true,
        completedAt: new Date(),
      }
    })

    // Award points
    await prisma.user.update({
      where: { id: session.userId },
      data: { points: { increment: task.points } }
    })

    return NextResponse.json({ success: true, pointsAwarded: task.points })
  } catch (error) {
    console.error('Complete task error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
