import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Users
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('senha123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mentoria.com' },
    update: {},
    create: {
      name: 'Admin Mentoria',
      email: 'admin@mentoria.com',
      password: adminPassword,
      role: 'admin',
      niche: 'Teologia',
      instagram: '@mentoriacriadores',
      followers: 15000,
      followersLast: 12000,
      postsThisMonth: 12,
      points: 450,
      level: 'Influenciador',
    }
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'ana@email.com' },
    update: {},
    create: {
      name: 'Ana Paula Silva',
      email: 'ana@email.com',
      password: userPassword,
      niche: 'Devocional',
      instagram: '@anapauladevocional',
      followers: 8500,
      followersLast: 7200,
      postsThisMonth: 8,
      points: 280,
      level: 'Consistente',
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      name: 'João Batista Mendes',
      email: 'joao@email.com',
      password: userPassword,
      niche: 'Psicologia Cristã',
      instagram: '@joaopsicocristao',
      followers: 22000,
      followersLast: 18000,
      postsThisMonth: 15,
      points: 380,
      level: 'Influenciador',
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'maria@email.com' },
    update: {},
    create: {
      name: 'Maria José Santos',
      email: 'maria@email.com',
      password: userPassword,
      niche: 'Família Cristã',
      instagram: '@mariafamiliacrista',
      followers: 3200,
      followersLast: 2800,
      postsThisMonth: 5,
      points: 120,
      level: 'Produtor',
    }
  })

  console.log('Users created')

  // Tasks
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        title: 'Criar 10 ideias de conteúdo',
        description: 'Use a Mochila de Ideias para registrar 10 ideias no kanban',
        points: 20,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        title: 'Gravar 3 vídeos esta semana',
        description: 'Produza e grave 3 vídeos para suas redes sociais',
        points: 30,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-3' },
      update: {},
      create: {
        id: 'task-3',
        title: 'Postar 5 conteúdos no Instagram',
        description: 'Publique 5 posts ou reels no Instagram esta semana',
        points: 25,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-4' },
      update: {},
      create: {
        id: 'task-4',
        title: 'Completar módulo 1 das aulas',
        description: 'Assista e complete todas as aulas do Módulo 1',
        points: 40,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-5' },
      update: {},
      create: {
        id: 'task-5',
        title: 'Interagir na comunidade',
        description: 'Faça 1 post e 3 comentários na comunidade da plataforma',
        points: 15,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-6' },
      update: {},
      create: {
        id: 'task-6',
        title: 'Usar o Assistente IA',
        description: 'Analise um roteiro ou gere ideias usando o Assistente IA',
        points: 10,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-7' },
      update: {},
      create: {
        id: 'task-7',
        title: 'Atualizar métricas de seguidores',
        description: 'Registre o número atual de seguidores no seu perfil',
        points: 5,
      }
    }),
  ])

  console.log('Tasks created')

  // Modules & Lessons
  const mod1 = await prisma.module.upsert({
    where: { id: 'mod-1' },
    update: {},
    create: {
      id: 'mod-1',
      title: 'Fundamentos do Criador Cristão',
      description: 'Os pilares para criar conteúdo cristão com propósito e impacto',
      order: 0,
      lessons: {
        create: [
          {
            id: 'lesson-1',
            title: 'Identidade e Chamado do Criador',
            description: 'Entenda seu papel como criador de conteúdo cristão e como Deus usa suas redes para o Reino.',
            order: 0,
            duration: 1800,
          },
          {
            id: 'lesson-2',
            title: 'Encontrando Seu Nicho Cristão',
            description: 'Como definir seu nicho, identificar sua audiência e criar uma voz única no mundo digital.',
            order: 1,
            duration: 2400,
          },
          {
            id: 'lesson-3',
            title: 'Os 3 Pilares do Conteúdo de Impacto',
            description: 'Verdade bíblica, relevância prática e conexão emocional: o tripé do conteúdo cristão viral.',
            order: 2,
            duration: 2100,
          },
        ]
      }
    }
  })

  const mod2 = await prisma.module.upsert({
    where: { id: 'mod-2' },
    update: {},
    create: {
      id: 'mod-2',
      title: 'Estratégias de Crescimento',
      description: 'Técnicas comprovadas para crescer no Instagram e alcançar mais pessoas para Cristo',
      order: 1,
      lessons: {
        create: [
          {
            id: 'lesson-4',
            title: 'O Algoritmo a Favor do Evangelho',
            description: 'Como usar o algoritmo do Instagram de forma estratégica para aumentar seu alcance orgânico.',
            order: 0,
            duration: 2700,
          },
          {
            id: 'lesson-5',
            title: 'Hooks que Param o Scroll',
            description: 'Aprenda a criar os primeiros 3 segundos perfeitos que fazem as pessoas pararem de rolar.',
            order: 1,
            duration: 1800,
          },
          {
            id: 'lesson-6',
            title: 'Consistência sem Burnout',
            description: 'Como manter uma produção consistente de conteúdo sem perder o fogo espiritual.',
            order: 2,
            duration: 2200,
          },
        ]
      }
    }
  })

  console.log('Modules and lessons created')

  // Content Ideas
  const ideas = await Promise.all([
    prisma.contentIdea.upsert({
      where: { id: 'idea-1' },
      update: {},
      create: {
        id: 'idea-1',
        theme: 'Ansiedade e a Paz de Deus',
        description: 'Série de 3 posts sobre como vencer a ansiedade através das promessas bíblicas, com aplicação prática para o dia a dia moderno.',
        context: 'A ansiedade é uma das questões mais prevalentes entre jovens cristãos. Conteúdo neste tema tem alto engajamento.',
        references: 'Fp 4:6-7; Mt 6:25-34; Is 26:3',
        category: 'Devocional',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-2' },
      update: {},
      create: {
        id: 'idea-2',
        theme: 'Deus no Trabalho: Fé e Carreira',
        description: 'Como integrar a fé cristã no ambiente de trabalho sem ser excludente, mantendo um testemunho vivo.',
        context: 'Jovens profissionais cristãos buscam conciliar fé e carreira. Nicho com alta demanda e baixa oferta.',
        references: 'Cl 3:23-24; Pv 22:29',
        category: 'Lifestyle',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-3' },
      update: {},
      create: {
        id: 'idea-3',
        theme: 'Relacionamento Abençoado: Sinais de Alerta',
        description: '5 sinais de alerta em relacionamentos que a Bíblia ensina a reconhecer antes do casamento.',
        context: 'Conteúdo sobre relacionamentos cristãos consistentemente viraliza. Alta identificação do público.',
        references: '2 Co 6:14; Pv 12:4; Ef 5:25',
        category: 'Relacionamentos',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-4' },
      update: {},
      create: {
        id: 'idea-4',
        theme: 'Testemunho de Restauração Financeira',
        description: 'Como Deus restaurou minha vida financeira através dos princípios bíblicos de mordomia.',
        context: 'Testemunhos reais de transformação financeira com base bíblica têm alto compartilhamento.',
        references: 'Ml 3:10; Pv 3:9-10; Lc 16:10-12',
        category: 'Lifestyle',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-5' },
      update: {},
      create: {
        id: 'idea-5',
        theme: 'A Oração que Muda Tudo',
        description: 'Tutorial sobre como criar uma rotina de oração transformadora com métodos bíblicos práticos.',
        context: 'Oração é universal no cristianismo. Conteúdo prático sobre oração sempre tem alta demanda.',
        references: 'Mt 6:9-13; 1 Ts 5:17; Tg 5:16',
        category: 'Devocional',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-6' },
      update: {},
      create: {
        id: 'idea-6',
        theme: 'Saúde Mental e Fé: Uma Visão Bíblica',
        description: 'Desmistificando a relação entre saúde mental, terapia e espiritualidade cristã.',
        context: 'Debate atual e necessário. Psicologia cristã é nicho em alta crescimento.',
        references: 'Sl 34:18; Is 61:1-3; Jo 10:10',
        category: 'Psicologia',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-7' },
      update: {},
      create: {
        id: 'idea-7',
        theme: 'Família Cristã em Tempos Digitais',
        description: 'Como criar uma família cristã saudável em meio às redes sociais, games e telas.',
        context: 'Pais cristãos buscam orientação para navegar o mundo digital com seus filhos.',
        references: 'Dt 6:6-7; Pv 22:6; Ef 6:4',
        category: 'Família',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-8' },
      update: {},
      create: {
        id: 'idea-8',
        theme: 'Humor Cristão: Rir é Bíblico!',
        description: 'Como usar o humor de forma saudável e edificante para alcançar pessoas para Cristo.',
        context: 'Humor cristão é uma das categorias de maior crescimento. Aproxima pessoas da fé de forma leve.',
        references: 'Pv 17:22; Ec 3:4; Sl 126:2',
        category: 'Lifestyle',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-9' },
      update: {},
      create: {
        id: 'idea-9',
        theme: 'Evangelismo nas Redes: Como e Por quê',
        description: 'Estratégias práticas para evangelizar de forma natural e poderosa nas redes sociais.',
        context: 'Evangelismo digital é responsabilidade de todo cristão conectado.',
        references: 'Mt 28:19-20; Rm 1:16; 1 Pe 3:15',
        category: 'Evangelismo',
      }
    }),
    prisma.contentIdea.upsert({
      where: { id: 'idea-10' },
      update: {},
      create: {
        id: 'idea-10',
        theme: 'Louvor Como Estilo de Vida',
        description: 'Além dos momentos de culto: como transformar cada dia em uma expressão de adoração.',
        context: 'Conteúdo sobre louvor e adoração conecta profundamente com cristãos de todas as idades.',
        references: 'Sl 150; Rm 12:1; Ef 5:19-20',
        category: 'Louvor',
      }
    }),
  ])

  console.log('Content ideas created')

  // Creators
  const creators = await Promise.all([
    prisma.creator.upsert({
      where: { id: 'creator-1' },
      update: {},
      create: {
        id: 'creator-1',
        name: 'Felipe Filho',
        niche: 'Teologia',
        instagram: '@felipefilho',
        examples: 'Conteúdo teológico profundo mas acessível. Especialista em apologética cristã e cosmovisão bíblica.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-2' },
      update: {},
      create: {
        id: 'creator-2',
        name: 'Mariana Godoy',
        niche: 'Devocional',
        instagram: '@marianagodoy',
        examples: 'Devocionais diários com linguagem contemporânea e aplicação prática. Forte no Stories e Reels.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-3' },
      update: {},
      create: {
        id: 'creator-3',
        name: 'Dr. Christian Dunker',
        niche: 'Psicologia Cristã',
        instagram: '@psicologiacristaoficial',
        examples: 'Psicologia cristã com base bíblica sólida. Une ciência e fé de forma equilibrada e edificante.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-4' },
      update: {},
      create: {
        id: 'creator-4',
        name: 'Casal Propósito',
        niche: 'Relacionamentos',
        instagram: '@casalproposito',
        examples: 'Conteúdo sobre namoro, casamento e família cristã. Autênticos, práticos e fundamentados na Bíblia.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-5' },
      update: {},
      create: {
        id: 'creator-5',
        name: 'Pastor Lucinho Barreto',
        niche: 'Evangelismo',
        instagram: '@lucinhojb',
        examples: 'Evangelismo urbano com alcance a jovens. Missão e impacto social com mensagem transformadora.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-6' },
      update: {},
      create: {
        id: 'creator-6',
        name: 'Danilo Monteiro',
        niche: 'Humor Cristão',
        instagram: '@danilohumorcristao',
        examples: 'Humor cristão edificante que viraliza. Alcança pessoas fora da igreja de forma leve e impactante.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-7' },
      update: {},
      create: {
        id: 'creator-7',
        name: 'Fernanda Brum',
        niche: 'Louvor',
        instagram: '@fernandabrum',
        examples: 'Louvor e adoração com profundidade espiritual. Conecta coração dos adoradores ao Pai.',
        avatar: null,
      }
    }),
    prisma.creator.upsert({
      where: { id: 'creator-8' },
      update: {},
      create: {
        id: 'creator-8',
        name: 'Pricila do Nascimento',
        niche: 'Lifestyle Cristão',
        instagram: '@priciladn',
        examples: 'Lifestyle cristão com autenticidade. Rotina, moda e fé unidos de forma equilibrada e inspiradora.',
        avatar: null,
      }
    }),
  ])

  console.log('Creators created')

  // Community posts
  await Promise.all([
    prisma.post.upsert({
      where: { id: 'post-1' },
      update: {},
      create: {
        id: 'post-1',
        content: 'Pessoal, acabei de postar um Reel sobre ansiedade e em 2 horas chegou a 10k visualizações! A mensagem do Salmo 34:18 tocou muita gente. Glória a Deus! Vamos continuar impactando vidas! 🙏',
        authorId: user1.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 'post-2' },
      update: {},
      create: {
        id: 'post-2',
        content: 'Dica de hoje: Use os primeiros 3 segundos do seu vídeo para fazer UMA pergunta que seu público já está se fazendo. Exemplo: "Você se sente ansioso mesmo depois de orar?" Isso para o scroll instantaneamente. Testei e meu engajamento subiu 40% 📈',
        authorId: user2.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 'post-3' },
      update: {},
      create: {
        id: 'post-3',
        content: 'Querida comunidade, hoje completei 1 ano criando conteúdo cristão e queria compartilhar: os primeiros 3 meses foram difíceis, com menos de 100 visualizações por vídeo. Mas não desisti! Hoje tenho 3.200 seguidores e mensagens de pessoas que encontraram fé pelo meu conteúdo. Valéu a pena! Não desistam 💜',
        authorId: user3.id,
      },
    }),
  ])

  console.log('Posts created')
  console.log('✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
