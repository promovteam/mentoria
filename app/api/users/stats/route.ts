export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        niche: true,
        followers: true,
        followersLast: true,
        postsThisMonth: true,
        points: true,
        level: true,
        _count: { select: { tasks: true, posts: true } }
      },
      orderBy: { points: 'desc' },
    })

    const withGrowth = users.map(u => ({
      ...u,
      followersGrowth: u.followers - u.followersLast,
      growthPercent: u.followersLast > 0
        ? Math.round(((u.followers - u.followersLast) / u.followersLast) * 100)
        : 0,
    }))

    return NextResponse.json({ users: withGrowth })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
