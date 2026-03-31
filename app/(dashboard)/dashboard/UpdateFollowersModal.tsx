'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  currentFollowers: number
}

export default function UpdateFollowersModal({ userId, currentFollowers }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [followers, setFollowers] = useState(String(currentFollowers))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/users/${userId}/followers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followers: Number(followers) }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        router.refresh()
      }, 1500)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/30 rounded-lg py-2.5 text-sm font-medium transition-colors"
      >
        Atualizar contagem
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Atualizar Seguidores</h3>
            <p className="text-sm text-[#888] mb-5">
              Informe o número atual de seguidores no Instagram
            </p>

            {success ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-green-400 font-medium">Atualizado com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="number"
                  value={followers}
                  onChange={e => setFollowers(e.target.value)}
                  min="0"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 text-sm text-[#888] hover:text-white border border-[#1f1f1f] rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
