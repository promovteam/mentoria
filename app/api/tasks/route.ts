import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        userTasks: {
          where: { userId: session.userId },
        }
      }
    })

    const tasksWithStatus = tasks.map(task => ({
      ...task,
      completed: task.userTasks.length > 0 && task.userTasks[0].completed,
      completedAt: task.userTasks[0]?.completedAt || null,
    }))

    return NextResponse.json({ tasks: tasksWithStatus })
  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
