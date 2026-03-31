'use client'

import { useState } from 'react'
import { Search, Lightbulb, BookOpen, ArrowRight, Check } from 'lucide-react'

interface Idea {
  id: string
  theme: string
  description: string
  context?: string | null
  references?: string | null
  category?: string | null
}

const CATEGORIES = ['Todas', 'Teologia', 'Devocional', 'Família', 'Evangelismo', 'Lifestyle', 'Psicologia', 'Relacionamentos', 'Louvor']

const categoryColors: Record<string, string> = {
  'Teologia': 'bg-blue-900/40 text-blue-300 border-blue-500/30',
  'Devocional': 'bg-violet-900/40 text-violet-300 border-violet-500/30',
  'Família': 'bg-pink-900/40 text-pink-300 border-pink-500/30',
  'Evangelismo': 'bg-orange-900/40 text-orange-300 border-orange-500/30',
  'Lifestyle': 'bg-green-900/40 text-green-300 border-green-500/30',
  'Psicologia': 'bg-teal-900/40 text-teal-300 border-teal-500/30',
  'Relacionamentos': 'bg-red-900/40 text-red-300 border-red-500/30',
  'Louvor': 'bg-amber-900/40 text-amber-300 border-amber-500/30',
}

export default function IdeiasClient({ ideas }: { ideas: Idea[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sendingToKanban, setSendingToKanban] = useState<string | null>(null)
  const [sentToKanban, setSentToKanban] = useState<Set<string>>(new Set())

  async function handleSendToKanban(idea: Idea, e: React.MouseEvent) {
    e.stopPropagation()
    if (sentToKanban.has(idea.id)) return
    setSendingToKanban(idea.id)
    const res = await fetch('/api/kanban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: idea.theme, description: idea.description, column: 'ideias' }),
    })
    setSendingToKanban(null)
    if (res.ok) {
      setSentToKanban(prev => new Set([...prev, idea.id]))
    }
  }

  const filtered = ideas.filter(idea => {
    const matchSearch = !search ||
      idea.theme.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todas' || idea.category === category
    return matchSearch && matchCat
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ideias..."
            className="w-full bg-[#111111] border border-[#1f1f1f] text-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                category === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#111111] border border-[#1f1f1f] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#888] mb-4">{filtered.length} ideias encontradas</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(idea => (
          <div
            key={idea.id}
            className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 hover:border-violet-500/30 transition-all cursor-pointer"
            onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} className="text-violet-400" />
              </div>
              {idea.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[idea.category] || 'bg-[#1a1a1a] text-[#888] border-[#333]'}`}>
                  {idea.category}
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-white mb-2">{idea.theme}</h3>
            <p className={`text-xs text-[#888] leading-relaxed ${expanded === idea.id ? '' : 'line-clamp-3'}`}>
              {idea.description}
            </p>

            {expanded === idea.id && (
              <div className="mt-4 space-y-3 border-t border-[#1f1f1f] pt-4">
                {idea.context && (
                  <div>
                    <p className="text-xs font-medium text-[#888] mb-1">Contexto</p>
                    <p className="text-xs text-[#e5e5e5] leading-relaxed">{idea.context}</p>
                  </div>
                )}
                {idea.references && (
                  <div className="flex items-start gap-2">
                    <BookOpen size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-violet-300">{idea.references}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-[#555]">
                {expanded === idea.id ? 'Clique para fechar' : 'Clique para expandir'}
              </p>
              <button
                onClick={e => handleSendToKanban(idea, e)}
                disabled={sendingToKanban === idea.id || sentToKanban.has(idea.id)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                  sentToKanban.has(idea.id)
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-violet-600/10 text-violet-400 border border-violet-500/20 hover:bg-violet-600/20'
                } disabled:opacity-60`}
              >
                {sentToKanban.has(idea.id) ? (
                  <><Check size={11} /> Adicionado</>
                ) : sendingToKanban === idea.id ? (
                  'Enviando...'
                ) : (
                  <><ArrowRight size={11} /> Kanban</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <Lightbulb size={40} className="mx-auto mb-3 opacity-20" />
          <p>Nenhuma ideia encontrada</p>
          {search && <p className="text-sm mt-1">Tente um termo diferente</p>}
        </div>
      )}
    </div>
  )
}
