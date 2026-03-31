import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAPPING_SYSTEM_PROMPT = `Você é um especialista em mapeamento de avatar para criadores de conteúdo cristão. Sua missão é conduzir uma conversa natural e acolhedora para entender profundamente o criador e seu público.

Você deve coletar as seguintes informações através de perguntas naturais (uma por vez, sem parecer um formulário):
1. Quem é o avatar (público-alvo): idade, gênero, momento de fé
2. Principal dor e luta do avatar
3. Maior desejo e sonho do avatar
4. Transformação que o criador oferece
5. Tom de voz e estilo de comunicação do criador
6. Nicho específico dentro do conteúdo cristão
7. Versículos e livros bíblicos favoritos do criador
8. Objeções que o avatar tem para consumir o conteúdo
9. Referências de criadores que o mentorado admira
10. Qual plataforma principal (Instagram, TikTok, YouTube)

REGRAS IMPORTANTES:
- Faça UMA pergunta por vez
- Seja acolhedor, use o nome da pessoa
- Quando tiver coletado todas as informações, diga exatamente: "MAPEAMENTO_CONCLUIDO" em uma nova linha (sozinho), seguido de um JSON com os dados no formato:
{"avatar_publico":"...","dor_principal":"...","desejo_principal":"...","transformacao":"...","tom_voz":"...","nicho":"...","referencias_biblicas":"...","objecoes":"...","referencias_criadores":"...","plataforma_principal":"..."}

Não revele que vai gerar um JSON. Apenas conduza a conversa naturalmente e ao final gere o marcador invisível.`

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-placeholder') {
      return NextResponse.json({
        result: 'Para usar o mapeamento de avatar, configure sua ANTHROPIC_API_KEY no arquivo .env',
        completed: false,
      })
    }

    const { messages, userName } = await req.json()

    const systemPrompt = MAPPING_SYSTEM_PROMPT.replace('use o nome da pessoa', `use o nome ${userName}`)

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    // Check if mapping is complete
    if (raw.includes('MAPEAMENTO_CONCLUIDO')) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0])

          // Generate a rich summary for the AI system prompt
          const summary = await generateAvatarSummary(client, data, userName)

          // Save to database
          await prisma.avatarMapping.upsert({
            where: { userId: session.userId },
            update: { summary, rawData: JSON.stringify(data), updatedAt: new Date() },
            create: { userId: session.userId, summary, rawData: JSON.stringify(data) },
          })

          // Return clean message without the JSON marker
          const cleanMessage = raw
            .replace('MAPEAMENTO_CONCLUIDO', '')
            .replace(/\{[\s\S]*\}/, '')
            .trim()

          return NextResponse.json({ result: cleanMessage, completed: true })
        } catch {
          // JSON parse failed, continue
        }
      }
    }

    return NextResponse.json({ result: raw, completed: false })
  } catch (error) {
    console.error('Avatar mapping error:', error)
    return NextResponse.json({ error: 'Erro ao processar mapeamento' }, { status: 500 })
  }
}

async function generateAvatarSummary(client: Anthropic, data: Record<string, string>, userName: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Com base nesse mapeamento de avatar do criador ${userName}, gere um parágrafo de contexto rico para ser usado como system prompt de uma IA geradora de roteiros. Seja específico e útil. Dados: ${JSON.stringify(data)}`
    }]
  })
  return response.content[0].type === 'text' ? response.content[0].text : ''
}
