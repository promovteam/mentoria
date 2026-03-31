'use client'

import { useState } from 'react'
import { Search, ShieldCheck, User, Trash2 } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  niche?: string | null
  followers: number
  points: number
  level: string
  role: string
  _count: { posts: number; kanbanCards: number }
}

const levelColors: Record<string, string> = {
  'Iniciante': 'bg-[#1a1a1a] text-[#888]',
  'Produtor': 'bg-blue-900/40 text-blue-300',
  'Consistente': 'bg-green-900/40 text-green-300',
  'Influenciador': 'bg-violet-900/40 text-violet-300',
  'Autoridade': 'bg-amber-900/40 text-amber-300',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UsuariosClient({ users: initial }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function toggleRole(id: string, currentRole: string) {
    setLoading(id)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    setLoading(null)
  }

  async function deleteUser(id: string) {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return
    setLoading(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id))
    setLoading(null)
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full bg-[#111] border border-[#1f1f1f] text-[#e5e5e5] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f1f1f]">
          <p className="text-xs text-[#666]">{filtered.length} usuários</p>
        </div>
        <div className="divide-y divide-[#141414]">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141414] transition-colors">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {getInitials(u.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  {u.role === 'admin' && (
                    <span className="text-xs px-1.5 py-0.5 bg-violet-600/20 text-violet-400 rounded-full">admin</span>
                  )}
                </div>
                <p className="text-xs text-[#555] mt-0.5">{u.email}</p>
              </div>

              {/* Niche */}
              <span className="text-xs text-[#666] hidden md:block w-32 truncate">{u.niche || '—'}</span>

              {/* Followers */}
              <div className="text-right hidden lg:block w-24">
                <p className="text-sm text-white">{u.followers.toLocaleString()}</p>
                <p className="text-xs text-[#555]">seguidores</p>
              </div>

              {/* Points */}
              <div className="text-right w-20">
                <p className="text-sm font-semibold text-violet-400">{u.points}</p>
                <p className="text-xs text-[#555]">pontos</p>
              </div>

              {/* Level */}
              <span className={`text-xs px-2 py-1 rounded-lg hidden sm:block ${levelColors[u.level] || levelColors['Iniciante']}`}>
                {u.level}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRole(u.id, u.role)}
                  disabled={loading === u.id}
                  title={u.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                    u.role === 'admin'
                      ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30'
                      : 'bg-[#1a1a1a] text-[#555] hover:text-white hover:bg-[#222]'
                  }`}
                >
                  {u.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={loading === u.id || u.role === 'admin'}
                  title="Remover usuário"
                  className="p-2 rounded-lg bg-[#1a1a1a] text-[#555] hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#555] text-sm">Nenhum usuário encontrado</div>
        )}
      </div>
    </div>
  )
}
