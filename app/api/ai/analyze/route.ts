export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em criação de conteúdo cristão para redes sociais, com profundo conhecimento em teologia, storytelling bíblico, e estratégias de crescimento no Instagram e TikTok.

Seu papel é ajudar criadores cristãos a:
- Criar conteúdo com impacto espiritual e alto engajamento
- Escrever roteiros com hooks poderosos fundamentados na Palavra
- Desenvolver legendas que conectam fé e vida prática
- Sugerir formatos que maximizem alcance sem comprometer a mensagem

Sempre responda em português brasileiro, de forma prática, encorajadora e com referências bíblicas relevantes quando apropriado.`

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-placeholder') {
      return NextResponse.json({
        result: '⚠️ Chave da API Anthropic não configurada. Configure ANTHROPIC_API_KEY no arquivo .env para usar o assistente IA.'
      })
    }

    const { type, content, niche, theme, topic } = await req.json()

    let userMessage = ''

    if (type === 'analyze-script') {
      userMessage = `Analise este roteiro de conteúdo cristão e forneça feedback detalhado:

ROTEIRO:
${content}

Por favor, avalie:
1. **Qualidade do Hook** (0-10): O início captura atenção?
2. **Clareza da Mensagem** (0-10): A mensagem cristã está clara?
3. **Potencial Viral** (0-10): Tem elementos compartilháveis?
4. **Referência Bíblica**: Sugira versículos que complementam
5. **Melhorias Sugeridas**: 3 mudanças específicas para melhorar
6. **Versão Melhorada**: Reescreva o hook de abertura`

    } else if (type === 'generate-ideas') {
      userMessage = `Gere 5 ideias de conteúdo cristão viral para o nicho: ${niche || 'Cristão'}
Tema específico: ${theme || 'vida cristã'}

Para cada ideia, forneça:
1. **Título/Hook**: Frase de abertura impactante
2. **Formato Sugerido**: (Reels, Carrossel, Vídeo longo, etc.)
3. **Estrutura**: 3 pontos principais
4. **Versículo Base**: Scripture relevante
5. **CTA**: Call-to-action para engajamento`

    } else if (type === 'evaluate-caption') {
      userMessage = `Avalie e melhore esta legenda para post cristão:

LEGENDA ATUAL:
${content}

Forneça:
1. **Pontuação** (0-10) com justificativa
2. **Pontos Fortes**: O que está funcionando
3. **Melhorias**: O que pode ser melhorado
4. **Versão Melhorada**: Reescreva a legenda completa
5. **Hashtags Sugeridas**: 10 hashtags relevantes`

    } else if (type === 'suggest-format') {
      userMessage = `Sugira o melhor formato pedagógico para este tópico de conteúdo cristão:

TÓPICO: ${topic}

Dos 17 formatos disponíveis (Tutorial, Storytelling, Antes e Depois, Top Lista, Q&A, Comparação, Caso de Estudo, Desafio, Desmistificando, Bastidores, Testemunho, Devocional, Citação+Reflexão, Erros Comuns, Recursos, Entrevista, Retrospectiva), recomende:

1. **Formato Principal**: Qual usar e por quê
2. **Formato Alternativo**: Segunda opção
3. **Estrutura Detalhada**: Como estruturar o conteúdo
4. **Exemplo de Hook**: Primeira linha do vídeo
5. **Dica de Produção**: Como gravar/criar esse formato`
    } else {
      return NextResponse.json({ error: 'Tipo de análise inválido' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json({ error: 'Erro ao processar com IA' }, { status: 500 })
  }
}
