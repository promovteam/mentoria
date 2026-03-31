'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, X, MessageSquare, Trash2, GripVertical } from 'lucide-react'

const COLUMNS = [
  { id: 'ideias', label: 'Mochila de Ideias', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'roteiro', label: 'Roteiro', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'gravacao', label: 'Gravação', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'edicao', label: 'Edição', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'postado', label: 'Postado', color: 'text-green-400', bg: 'bg-green-500/10' },
]

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
}

interface Card {
  id: string
  title: string
  description?: string | null
  column: string
  order: number
  comments: Comment[]
}

function KanbanCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3 cursor-pointer hover:border-violet-500/40 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-[#444] hover:text-[#888] flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e5e5e5] leading-snug">{card.title}</p>
          {card.description && (
            <p className="text-xs text-[#666] mt-1 line-clamp-2">{card.description}</p>
          )}
          {card.comments.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <MessageSquare size={11} className="text-[#666]" />
              <span className="text-xs text-[#666]">{card.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CardModal({ card, onClose, onUpdate, onDelete }: {
  card: Card
  onClose: () => void
  onUpdate: (updated: Card) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(card.comments)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/kanban/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      onUpdate({ ...data.card, comments })
      onClose()
    }
  }

  async function handleAddComment() {
    if (!comment.trim()) return
    // For now, store locally (you'd normally POST to API)
    const newComment: Comment = {
      id: Date.now().toString(),
      content: comment,
      authorName: 'Você',
      createdAt: new Date().toISOString(),
    }
    setComments(prev => [...prev, newComment])
    setComment('')
  }

  async function handleDelete() {
    if (!confirm('Excluir este card?')) return
    const res = await fetch(`/api/kanban/${card.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(card.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#1f1f1f]">
          <h3 className="font-semibold text-white">Editar Card</h3>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="p-2 hover:bg-red-500/10 text-[#666] hover:text-red-400 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[#1a1a1a] text-[#666] hover:text-white rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Adicione detalhes, referências bíblicas, ideias..."
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>

          <div>
            <label className="block text-xs text-[#888] mb-2">Comentários</label>
            <div className="space-y-2 mb-3">
              {comments.map(c => (
                <div key={c.id} className="bg-[#0a0a0a] rounded-lg p-3">
                  <p className="text-xs text-violet-400 font-medium mb-1">{c.authorName}</p>
                  <p className="text-sm text-[#e5e5e5]">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Adicionar comentário..."
                className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-[#e5e5e5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
              <button onClick={handleAddComment} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    fetch('/api/kanban')
      .then(r => r.json())
      .then(d => { setCards(d.cards || []); setLoading(false) })
  }, [])

  function getColumnCards(col: string) {
    return cards.filter(c => c.column === col).sort((a, b) => a.order - b.order)
  }

  function handleDragStart(e: DragStartEvent) {
    const card = cards.find(c => c.id === e.active.id)
    setActiveCard(card || null)
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveCard(null)
    if (!over) return

    const activeCardData = cards.find(c => c.id === active.id)
    if (!activeCardData) return

    // Find which column we dropped on
    const overCard = cards.find(c => c.id === over.id)
    const overColumnId = overCard ? overCard.column : COLUMNS.find(c => c.id === over.id)?.id

    if (!overColumnId) return
    if (activeCardData.column === overColumnId && active.id === over.id) return

    const updatedCards = cards.map(c => {
      if (c.id === active.id) {
        return { ...c, column: overColumnId }
      }
      return c
    })
    setCards(updatedCards)

    await fetch(`/api/kanban/${active.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: overColumnId }),
    })
  }

  async function handleAddCard(column: string) {
    if (!newTitle.trim()) return
    const res = await fetch('/api/kanban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, column }),
    })
    if (res.ok) {
      const data = await res.json()
      setCards(prev => [...prev, data.card])
    }
    setNewTitle('')
    setNewCardColumn(null)
  }

  if (loading) {
    return <div className="text-[#888] text-sm">Carregando kanban...</div>
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colCards = getColumnCards(col.id)
            return (
              <div key={col.id} className="flex-shrink-0 w-64">
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 ${col.bg} rounded-xl mb-3`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${col.color}`}>{col.label}</span>
                    <span className="text-xs bg-black/30 text-[#888] px-1.5 py-0.5 rounded-full">{colCards.length}</span>
                  </div>
                  <button
                    onClick={() => setNewCardColumn(col.id)}
                    className={`${col.color} hover:opacity-70 transition-opacity`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Cards */}
                <SortableContext items={colCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[100px]">
                    {colCards.map(card => (
                      <KanbanCard key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                    ))}
                  </div>
                </SortableContext>

                {/* Add card form */}
                {newCardColumn === col.id && (
                  <div className="mt-2 bg-[#0a0a0a] border border-violet-500/40 rounded-xl p-3">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddCard(col.id)
                        if (e.key === 'Escape') setNewCardColumn(null)
                      }}
                      placeholder="Título do card..."
                      className="w-full bg-transparent text-sm text-[#e5e5e5] placeholder-[#555] focus:outline-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddCard(col.id)}
                        className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setNewCardColumn(null)}
                        className="text-xs text-[#888] hover:text-white px-2 py-1.5 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {colCards.length === 0 && newCardColumn !== col.id && (
                  <button
                    onClick={() => setNewCardColumn(col.id)}
                    className="w-full mt-2 border border-dashed border-[#2a2a2a] rounded-xl p-3 text-xs text-[#555] hover:text-[#888] hover:border-[#333] transition-colors"
                  >
                    + Adicionar card
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-[#0a0a0a] border border-violet-500/50 rounded-xl p-3 shadow-2xl w-64 rotate-2">
              <p className="text-sm font-medium text-[#e5e5e5]">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={updated => {
            setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
            setSelectedCard(null)
          }}
          onDelete={id => {
            setCards(prev => prev.filter(c => c.id !== id))
          }}
        />
      )}
    </>
  )
}
