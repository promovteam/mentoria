import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true, niche: true } },
        likes: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' },
        }
      }
    })

    const postsWithLiked = posts.map(post => ({
      ...post,
      likedByMe: post.likes.some(l => l.userId === session.userId),
      likesCount: post.likes.length,
    }))

    return NextResponse.json({ posts: postsWithLiked })
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: { content, authorId: session.userId },
      include: {
        author: { select: { id: true, name: true, avatar: true, niche: true } },
        likes: true,
        comments: true,
      }
    })

    // Award points for posting
    await prisma.user.update({
      where: { id: session.userId },
      data: { postsThisMonth: { increment: 1 } }
    })

    return NextResponse.json({ post: { ...post, likedByMe: false, likesCount: 0 } }, { status: 201 })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
