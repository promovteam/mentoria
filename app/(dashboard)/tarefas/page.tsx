'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Trophy } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string | null
  points: number
  completed: boolean
  completedAt?: string | null
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setLoading(false) })
  }, [])

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleComplete(taskId: string) {
    setCompleting(taskId)
    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
    if (res.ok) {
      await res.json()
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))
      setJustCompleted(taskId)
      setTimeout(() => setJustCompleted(null), 2000)
    }
    setCompleting(null)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-[#888]">Carregando tarefas...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tarefas</h1>
        <p className="text-[#888888] mt-1">Complete tarefas e ganhe pontos para o ranking</p>
      </div>

      {/* Progress */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">Progresso Geral</p>
            <p className="text-xs text-[#888] mt-0.5">{completed} de {total} tarefas concluídas</p>
          </div>
          <span className="text-2xl font-bold text-violet-400">{percent}%</span>
        </div>
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`bg-[#111111] border rounded-xl p-4 transition-all duration-300 ${
              justCompleted === task.id
                ? 'border-green-500/50 bg-green-500/5'
                : task.completed
                ? 'border-[#1f1f1f] opacity-70'
                : 'border-[#1f1f1f] hover:border-violet-500/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => !task.completed && handleComplete(task.id)}
                disabled={task.completed || completing === task.id}
                className={`mt-0.5 flex-shrink-0 transition-all duration-200 ${
                  task.completed ? 'text-green-500' : 'text-[#444] hover:text-violet-400'
                } disabled:cursor-default`}
              >
                {task.completed ? (
                  <CheckCircle size={22} />
                ) : completing === task.id ? (
                  <svg className="animate-spin w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <Circle size={22} />
                )}
              </button>

              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'text-[#666] line-through' : 'text-white'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-[#888] mt-1">{task.description}</p>
                )}
                {task.completed && task.completedAt && (
                  <p className="text-xs text-green-500/70 mt-1">
                    Concluída em {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-violet-600/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                <Trophy size={12} className="text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">+{task.points}</span>
              </div>
            </div>

            {justCompleted === task.id && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <span>🎉</span>
                <span>Parabéns! Você ganhou {task.points} pontos!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <Trophy size={40} className="mx-auto mb-3 opacity-20" />
          <p>Nenhuma tarefa disponível no momento</p>
        </div>
      )}
    </div>
  )
}
