import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: params.id, userId: session.userId } }
    })

    if (existing) {
      await prisma.postLike.delete({
        where: { postId_userId: { postId: params.id, userId: session.userId } }
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.postLike.create({
        data: { postId: params.id, userId: session.userId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
