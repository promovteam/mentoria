import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Only allow updating own followers
    if (session.userId !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { followers } = await req.json()
    if (typeof followers !== 'number' || followers < 0) {
      return NextResponse.json({ error: 'Número de seguidores inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        followersLast: user.followers,
        followers,
      },
      select: { id: true, followers: true, followersLast: true }
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Followers update error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
