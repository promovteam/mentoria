'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface Idea {
  id: string
  theme: string
  description: string
  context?: string | null
  references?: string | null
  category?: string | null
}

const CATEGORIES = ['Teologia', 'Devocional', 'Família', 'Evangelismo', 'Lifestyle', 'Psicologia', 'Relacionamentos', 'Louvor']

const empty: Omit<Idea, 'id'> = { theme: '', description: '', context: '', references: '', category: 'Devocional' }

export default function IdeiasAdminClient({ ideas: initial }: { ideas: Idea[] }) {
  const [ideas, setIdeas] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<Idea, 'id'>>(empty)
  const [saving, setSaving] = useState(false)

  function startEdit(idea: Idea) {
    setEditing(idea.id)
    setCreating(false)
    setForm({ theme: idea.theme, description: idea.description, context: idea.context || '', references: idea.references || '', category: idea.category || 'Devocional' })
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(empty)
  }

  function cancel() {
    setEditing(null)
    setCreating(false)
    setForm(empty)
  }

  async function save() {
    if (!form.theme.trim() || !form.description.trim()) return
    setSaving(true)
    if (creating) {
      const res = await fetch('/api/admin/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { idea } = await res.json()
        setIdeas(prev => [idea, ...prev])
        cancel()
      }
    } else if (editing) {
      const res = await fetch(`/api/admin/ideas/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setIdeas(prev => prev.map(i => i.id === editing ? { ...i, ...form } : i))
        cancel()
      }
    }
    setSaving(false)
  }

  async function deleteIdea(id: string) {
    if (!confirm('Remover esta ideia?')) return
    const res = await fetch(`/api/admin/ideas/${id}`, { method: 'DELETE' })
    if (res.ok) setIdeas(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      {/* Create/Edit form */}
      {(creating || editing) && (
        <div className="bg-[#111] border border-violet-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">{creating ? 'Nova Ideia' : 'Editar Ideia'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Tema *</label>
              <input
                value={form.theme}
                onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#888] mb-1 block">Descrição *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Contexto</label>
              <textarea
                value={form.context || ''}
                onChange={e => setForm(p => ({ ...p, context: e.target.value }))}
                rows={2}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Referências bíblicas</label>
              <input
                value={form.references || ''}
                onChange={e => setForm(p => ({ ...p, references: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Categoria</label>
              <select
                value={form.category || ''}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              <Check size={14} /> Salvar
            </button>
            <button onClick={cancel} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-[#aaa] rounded-lg text-sm transition-colors">
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <button
        onClick={startCreate}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors mb-6"
      >
        <Plus size={15} /> Nova Ideia
      </button>

      {/* List */}
      <div className="space-y-3">
        {ideas.map(idea => (
          <div key={idea.id} className={`bg-[#111] border rounded-xl p-5 transition-all ${editing === idea.id ? 'border-violet-500/30 opacity-40' : 'border-[#1f1f1f]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {idea.category && (
                    <span className="text-xs px-2 py-0.5 bg-violet-600/10 text-violet-400 rounded-full">{idea.category}</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white">{idea.theme}</p>
                <p className="text-xs text-[#888] mt-1 line-clamp-2">{idea.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(idea)} className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#666] hover:text-white hover:bg-[#222] transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteIdea(idea.id)} className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#666] hover:text-red-400 hover:bg-red-900/20 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
