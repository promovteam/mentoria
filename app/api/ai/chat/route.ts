import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BASE_SYSTEM_PROMPT = `Você é um assistente especialista em criação de conteúdo cristão para redes sociais, com profundo conhecimento em teologia, storytelling bíblico, e estratégias de crescimento no Instagram, TikTok e YouTube.

Seu papel é ajudar criadores cristãos a:
- Criar conteúdo com impacto espiritual e alto engajamento
- Escrever roteiros com hooks poderosos fundamentados na Palavra
- Desenvolver legendas que conectam fé e vida prática
- Sugerir os 17 formatos pedagógicos: Tutorial, Storytelling, Antes e Depois, Top Lista, Q&A, Comparação, Caso de Estudo, Desafio, Desmistificando, Bastidores, Testemunho, Devocional, Citação+Reflexão, Erros Comuns, Recursos, Entrevista, Retrospectiva

Sempre responda em português brasileiro, de forma prática e encorajadora, com referências bíblicas quando relevante.`

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-placeholder') {
      return NextResponse.json({
        result: '⚠️ Configure sua `ANTHROPIC_API_KEY` no arquivo `.env` para usar o assistente IA.'
      })
    }

    const { messages } = await req.json()
    if (!messages?.length) return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })

    // Load user's avatar mapping if it exists
    const avatarMapping = await prisma.avatarMapping.findUnique({
      where: { userId: session.userId },
    })

    const systemPrompt = avatarMapping
      ? `${BASE_SYSTEM_PROMPT}

---
AVATAR MAPEADO DO CRIADOR:
${avatarMapping.summary}

Use sempre esse contexto do avatar para personalizar roteiros, ideias e sugestões. Todo conteúdo deve ser pensado para esse público específico.`
      : BASE_SYSTEM_PROMPT

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const result = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Erro ao processar com IA' }, { status: 500 })
  }
}
