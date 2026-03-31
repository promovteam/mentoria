'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NICHES = [
  'Teologia',
  'Devocional',
  'Família Cristã',
  'Louvor e Adoração',
  'Evangelismo',
  'Humor Cristão',
  'Psicologia Cristã',
  'Relacionamentos',
  'Lifestyle Cristão',
  'Finanças Cristãs',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', instagram: '', niche: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta')
      } else {
        // Auto-login
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        if (loginRes.ok) {
          router.push('/dashboard')
          router.refresh()
        } else {
          router.push('/login')
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-800/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2v8M8 6h8M5 10h14l-1.5 10h-11L5 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Mentoria Criadores</h1>
          <p className="text-[#888888] mt-1 text-sm">Crie sua conta gratuitamente</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Nome completo *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Seu nome"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Senha *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Instagram (opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">@</span>
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="seuinstagram"
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Nicho de conteúdo (opcional)</label>
              <select
                name="niche"
                value={form.niche}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">Selecione seu nicho...</option>
                {NICHES.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Criando conta...
                </span>
              ) : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888888] mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
