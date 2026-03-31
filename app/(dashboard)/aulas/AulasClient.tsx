'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, CheckCircle, Download, Clock } from 'lucide-react'

interface Download {
  id: string
  title: string
  url: string
}

interface Lesson {
  id: string
  title: string
  description?: string | null
  videoUrl?: string | null
  duration?: number | null
  order: number
  completed: boolean
  downloads: Download[]
}

interface Module {
  id: string
  title: string
  description?: string | null
  order: number
  completedCount: number
  lessons: Lesson[]
}

export default function AulasClient({ modules }: { modules: Module[] }) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([modules[0]?.id]))
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [, setCompleting] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(modules.flatMap(m => m.lessons.filter(l => l.completed).map(l => l.id)))
  )

  function toggleModule(id: string) {
    setOpenModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function markComplete(lessonId: string) {
    if (completed.has(lessonId)) return
    setCompleting(lessonId)
    // Would POST to /api/lessons/{id}/complete in a full implementation
    // For now, just mark locally
    setCompleted(prev => new Set([...prev, lessonId]))
    setCompleting(null)
  }

  function formatDuration(seconds?: number | null) {
    if (!seconds) return null
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalCompleted = completed.size

  return (
    <div>
      {/* Overall progress */}
      {totalLessons > 0 && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#888]">Progresso total</p>
            <p className="text-sm font-semibold text-violet-400">{totalCompleted}/{totalLessons} aulas</p>
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Active video */}
      {activeLesson && (
        <div className="bg-[#111111] border border-violet-500/30 rounded-xl overflow-hidden mb-6">
          <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center">
            {activeLesson.videoUrl ? (
              <iframe
                src={activeLesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#444]">
                <Play size={48} />
                <p className="text-sm">Vídeo em breve</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-white font-semibold">{activeLesson.title}</h3>
            {activeLesson.description && (
              <p className="text-sm text-[#888] mt-2">{activeLesson.description}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                {activeLesson.downloads.map(d => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-600/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download size={12} />
                    {d.title}
                  </a>
                ))}
              </div>
              <button
                onClick={() => markComplete(activeLesson.id)}
                disabled={completed.has(activeLesson.id)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${
                  completed.has(activeLesson.id)
                    ? 'bg-green-500/10 text-green-400 cursor-default'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                <CheckCircle size={14} />
                {completed.has(activeLesson.id) ? 'Concluída' : 'Marcar concluída'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="space-y-3">
        {modules.map(mod => {
          const isOpen = openModules.has(mod.id)
          const modCompleted = mod.lessons.filter(l => completed.has(l.id)).length
          const modTotal = mod.lessons.length
          const modPercent = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0

          return (
            <div key={mod.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    modPercent === 100 ? 'bg-green-500/20 text-green-400' : 'bg-violet-600/20 text-violet-400'
                  }`}>
                    {mod.order + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{mod.title}</p>
                    <p className="text-xs text-[#888]">{modCompleted}/{modTotal} aulas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${modPercent}%` }} />
                    </div>
                    <span className="text-xs text-[#888]">{modPercent}%</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-[#666]" /> : <ChevronRight size={16} className="text-[#666]" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#1f1f1f]">
                  {mod.lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#1a1a1a] last:border-b-0 ${
                        activeLesson?.id === lesson.id
                          ? 'bg-violet-600/10'
                          : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        completed.has(lesson.id)
                          ? 'bg-green-500/20 text-green-400'
                          : activeLesson?.id === lesson.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#1a1a1a] text-[#666]'
                      }`}>
                        {completed.has(lesson.id) ? <CheckCircle size={14} /> : <Play size={12} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${completed.has(lesson.id) ? 'text-[#666]' : 'text-[#e5e5e5]'}`}>
                          {i + 1}. {lesson.title}
                        </p>
                      </div>
                      {lesson.duration && (
                        <div className="flex items-center gap-1 text-xs text-[#666]">
                          <Clock size={11} />
                          {formatDuration(lesson.duration)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <Play size={40} className="mx-auto mb-3 opacity-20" />
          <p>Módulos em breve</p>
        </div>
      )}
    </div>
  )
}
