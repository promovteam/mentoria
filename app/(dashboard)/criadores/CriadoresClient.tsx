'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface Creator {
  id: string
  name: string
  niche: string
  instagram: string
  examples?: string | null
  avatar?: string | null
}

const NICHES = ['Todos', 'Teologia', 'Devocional', 'Psicologia Cristã', 'Relacionamentos', 'Humor Cristão', 'Lifestyle Cristão', 'Louvor', 'Evangelismo', 'Família Cristã']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const nicheColors: Record<string, string> = {
  'Teologia': 'from-blue-600 to-blue-800',
  'Devocional': 'from-violet-600 to-violet-800',
  'Psicologia Cristã': 'from-teal-600 to-teal-800',
  'Relacionamentos': 'from-pink-600 to-pink-800',
  'Humor Cristão': 'from-yellow-600 to-orange-700',
  'Lifestyle Cristão': 'from-green-600 to-green-800',
  'Louvor': 'from-purple-600 to-purple-800',
  'Evangelismo': 'from-orange-600 to-red-700',
  'Família Cristã': 'from-rose-600 to-rose-800',
}

export default function CriadoresClient({ creators }: { creators: Creator[] }) {
  const [niche, setNiche] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = creators.filter(c => {
    const matchNiche = niche === 'Todos' || c.niche === niche
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.niche.toLowerCase().includes(search.toLowerCase())
    return matchNiche && matchSearch
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar criador..."
          className="bg-[#111111] border border-[#1f1f1f] text-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 max-w-md"
        />
        <div className="flex gap-2 flex-wrap">
          {NICHES.map(n => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                niche === n
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#111111] border border-[#1f1f1f] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(creator => (
          <div key={creator.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 hover:border-violet-500/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${nicheColors[creator.niche] || 'from-violet-600 to-violet-800'} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                {creator.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(creator.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{creator.name}</p>
                <p className="text-xs text-[#888]">{creator.niche}</p>
              </div>
            </div>

            {creator.examples && (
              <p className="text-xs text-[#888] leading-relaxed mb-4 line-clamp-3">
                {creator.examples}
              </p>
            )}

            <a
              href={`https://instagram.com/${creator.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 rounded-lg px-3 py-2 transition-all"
            >
              <ExternalLink size={13} />
              {creator.instagram}
              <ExternalLink size={11} className="ml-auto" />
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <p>Nenhum criador encontrado</p>
        </div>
      )}
    </div>
  )
}
