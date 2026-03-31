import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

const FORMATS = [
  {
    id: 1,
    name: 'Tutorial Passo a Passo',
    icon: '📋',
    description: 'Ensina uma habilidade ou processo de forma sequencial e clara.',
    structure: ['Problema que resolve', 'Materiais necessários', 'Passo 1, 2, 3...', 'Resultado final'],
    examples: ['Como ler a Bíblia em 1 ano', 'Como fazer um devocional diário', 'Como montar um altar em casa'],
    reference: 'Pr 4:7 — "O começo da sabedoria é este: adquire a sabedoria"',
  },
  {
    id: 2,
    name: 'Storytelling',
    icon: '📖',
    description: 'Conta uma história real ou bíblica que transmite um ensinamento profundo.',
    structure: ['Contexto/Cenário', 'Conflito/Desafio', 'Virada/Revelação', 'Lição aprendida'],
    examples: ['Como Deus me restaurou depois da depressão', 'A história de José como modelo de resiliência'],
    reference: 'Sl 107:2 — "Digam os remidos do Senhor"',
  },
  {
    id: 3,
    name: 'Antes e Depois',
    icon: '🔄',
    description: 'Mostra uma transformação real, espiritual ou prática, com impacto visual.',
    structure: ['Estado inicial (o "antes")', 'O que mudou', 'Como mudou', 'O estado atual'],
    examples: ['Minha vida antes e depois de encontrar a fé', 'Minha rotina antes e depois do devocional'],
    reference: '2 Co 5:17 — "Quem está em Cristo, nova criatura é"',
  },
  {
    id: 4,
    name: 'Top Lista',
    icon: '🏆',
    description: 'Lista os melhores, piores ou mais importantes itens sobre um tema.',
    structure: ['Introdução do tema', 'Item N ao 1 (ou 1 ao N)', 'Por que esse ranking', 'CTA'],
    examples: ['5 versículos para ansiedade', '7 hábitos de cristãos que crescem no Instagram'],
    reference: 'Fp 4:8 — "Tudo que é verdadeiro... pensai nisso"',
  },
  {
    id: 5,
    name: 'Perguntas e Respostas',
    icon: '❓',
    description: 'Responde dúvidas reais da audiência sobre fé, vida cristã e criação de conteúdo.',
    structure: ['Apresenta a pergunta', 'Contexto bíblico', 'Resposta prática', 'Aplicação diária'],
    examples: ['Posso ouvir música secular?', 'Deus está com raiva de mim quando peco?'],
    reference: 'Tg 1:5 — "Se alguém carece de sabedoria, peça a Deus"',
  },
  {
    id: 6,
    name: 'Comparação',
    icon: '⚖️',
    description: 'Compara duas abordagens, perspectivas ou situações para destacar diferenças.',
    structure: ['Opção A vs Opção B', 'Critérios de comparação', 'Pontos positivos e negativos', 'Conclusão'],
    examples: ['Religião vs Relacionamento com Deus', 'Fé sem obras vs Fé com obras'],
    reference: 'Rm 12:2 — "Transformai-vos pela renovação do entendimento"',
  },
  {
    id: 7,
    name: 'Caso de Estudo',
    icon: '🔍',
    description: 'Analisa em profundidade um exemplo bíblico ou contemporâneo.',
    structure: ['Apresentação do caso', 'Contexto histórico/bíblico', 'Análise detalhada', 'Lições aplicáveis'],
    examples: ['O caso de David e Bate-Seba: restauração após o pecado', 'Paulo nas prisões: gratidão no sofrimento'],
    reference: 'Rm 15:4 — "As coisas que foram escritas... são para o nosso ensino"',
  },
  {
    id: 8,
    name: 'Desafio',
    icon: '💪',
    description: 'Propõe um desafio prático que engaja e transforma a audiência.',
    structure: ['O desafio em si', 'Por que fazer', 'Regras/instruções', 'Convite para compartilhar'],
    examples: ['Desafio: 7 dias lendo Provérbios', 'Desafio: 30 dias sem reclamar'],
    reference: 'Hb 12:1 — "Corramos com perseverança a corrida que nos é proposta"',
  },
  {
    id: 9,
    name: 'Desmistificando',
    icon: '🧩',
    description: 'Descstrói mitos e equívocos comuns sobre a fé cristã e a Bíblia.',
    structure: ['O mito popular', 'Por que as pessoas acreditam nisso', 'A verdade bíblica', 'Como aplicar'],
    examples: ['Mito: Deus não quer que você seja rico', 'Mito: Precisamos sentir algo para Deus estar presente'],
    reference: 'Jo 8:32 — "A verdade vos libertará"',
  },
  {
    id: 10,
    name: 'Bastidores',
    icon: '🎬',
    description: 'Mostra o processo criativo, a vida real por trás do conteúdo.',
    structure: ['O que você está fazendo', 'Por que faz assim', 'Dificuldades e aprendizados', 'Convite à autenticidade'],
    examples: ['Como gravo meus vídeos cristãos sozinho', 'O que acontece antes das minhas transmissões ao vivo'],
    reference: 'Ec 9:10 — "Tudo quanto te vier à mão para fazer, faze-o com todo o teu poder"',
  },
  {
    id: 11,
    name: 'Testemunho',
    icon: '🙏',
    description: 'Compartilha uma história pessoal de fé, superação ou milagre.',
    structure: ['A situação antes', 'O momento de crise ou encontro', 'A intervenção de Deus', 'A vida depois'],
    examples: ['Como Deus me livrou da ansiedade', 'O milagre que mudou minha família'],
    reference: 'Ap 12:11 — "Eles o venceram... pela palavra do seu testemunho"',
  },
  {
    id: 12,
    name: 'Devocional',
    icon: '✝️',
    description: 'Reflexão profunda sobre um texto bíblico com aplicação prática.',
    structure: ['Texto bíblico base', 'Contexto histórico', 'Reflexão espiritual', 'Aplicação prática + oração'],
    examples: ['Sl 23: O Senhor é meu pastor em 2024', 'Jo 15: Permanecer na videira no mundo moderno'],
    reference: 'Sl 119:105 — "Lâmpada para os meus pés é tua palavra"',
  },
  {
    id: 13,
    name: 'Citação + Reflexão',
    icon: '💬',
    description: 'Usa uma citação poderosa como ponto de partida para aprofundamento.',
    structure: ['A citação (bíblica ou de autor cristão)', 'Contexto da citação', 'Por que ressoa hoje', 'Aplicação prática'],
    examples: ['C.S. Lewis sobre o problema do sofrimento', 'Spurgeon sobre oração e fé'],
    reference: 'Fp 4:11 — "Aprendi a contentar-me em qualquer estado em que me encontre"',
  },
  {
    id: 14,
    name: 'Erros Comuns',
    icon: '⚠️',
    description: 'Aponta equívocos frequentes e oferece a correção construtiva.',
    structure: ['O erro #1, #2, #3...', 'Por que as pessoas cometem', 'A abordagem correta', 'Como corrigir'],
    examples: ['3 erros ao estudar a Bíblia', '5 erros de quem está começando criar conteúdo cristão'],
    reference: 'Pv 12:1 — "Quem ama a instrução ama o conhecimento"',
  },
  {
    id: 15,
    name: 'Recursos e Ferramentas',
    icon: '🛠️',
    description: 'Compartilha ferramentas, apps, livros ou recursos úteis para o crescimento.',
    structure: ['O problema que resolve', 'Recurso 1, 2, 3...', 'Como usar cada um', 'Recomendação final'],
    examples: ['5 apps cristãos para crescer espiritualmente', 'Os melhores livros sobre criação de conteúdo cristão'],
    reference: 'Pv 24:5 — "O homem sábio é forte; sim, o homem de conhecimento aumenta a força"',
  },
  {
    id: 16,
    name: 'Entrevista',
    icon: '🎤',
    description: 'Entrevista um líder, criador ou cristão com história inspiradora.',
    structure: ['Apresentação do entrevistado', 'Perguntas sobre jornada', 'Lições e conselhos', 'Conclusão e contatos'],
    examples: ['Entrevista com um pastor sobre redes sociais', 'Criadores cristãos compartilhando sua jornada'],
    reference: 'Pv 27:17 — "O ferro afia o ferro; assim um homem afia o outro"',
  },
  {
    id: 17,
    name: 'Retrospectiva',
    icon: '🗓️',
    description: 'Revisita o que aconteceu em um período, extraindo aprendizados.',
    structure: ['O período revisitado', 'Os maiores aprendizados', 'O que mudaria', 'O que vem por aí'],
    examples: ['O que aprendi criando conteúdo cristão em 1 ano', 'Retrospectiva: meu crescimento espiritual em 2024'],
    reference: 'Dt 8:2 — "Lembra-te de todo o caminho pelo qual o Senhor teu Deus te conduziu"',
  },
]

export default async function FormatosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Formatos de Conteúdo</h1>
        <p className="text-[#888888] mt-1">17 formatos pedagógicos para criar conteúdo cristão de impacto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {FORMATS.map(format => (
          <details key={format.id} className="group bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-violet-500/30 transition-colors">
            <summary className="flex items-center gap-3 p-5 cursor-pointer list-none">
              <span className="text-2xl">{format.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{format.name}</p>
                <p className="text-xs text-[#888] mt-0.5 line-clamp-1">{format.description}</p>
              </div>
              <span className="text-xs text-[#555] group-open:hidden">+</span>
              <span className="text-xs text-[#555] hidden group-open:block">−</span>
            </summary>

            <div className="px-5 pb-5 border-t border-[#1a1a1a] pt-4 space-y-4">
              <p className="text-xs text-[#888] leading-relaxed">{format.description}</p>

              <div>
                <p className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Estrutura</p>
                <ol className="space-y-1">
                  {format.structure.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#e5e5e5]">
                      <span className="text-violet-400 font-bold flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Exemplos</p>
                <ul className="space-y-1">
                  {format.examples.map((ex, i) => (
                    <li key={i} className="text-xs text-[#888] before:content-['→'] before:mr-2 before:text-violet-400">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-2 bg-violet-600/10 border border-violet-500/20 rounded-lg p-3">
                <span className="text-violet-400 text-sm">✝️</span>
                <p className="text-xs text-violet-300 italic">{format.reference}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
