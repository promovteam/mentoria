'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatar?: string | null }
}

interface Post {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string; avatar?: string | null; niche?: string | null }
  likesCount: number
  likedByMe: boolean
  comments: Comment[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function ComunidadeClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false) })
  }, [])

  async function handlePost() {
    if (!newPost.trim() || posting) return
    setPosting(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPost }),
    })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => [data.post, ...prev])
      setNewPost('')
    }
    setPosting(false)
  }

  async function handleLike(postId: string) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likedByMe: data.liked,
        likesCount: data.liked ? p.likesCount + 1 : p.likesCount - 1,
      } : p))
    }
  }

  async function handleComment(postId: string) {
    const content = commentTexts[postId]?.trim()
    if (!content) return
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        comments: [...p.comments, data.comment],
      } : p))
      setCommentTexts(prev => ({ ...prev, [postId]: '' }))
    }
  }

  function toggleComments(postId: string) {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  return (
    <div>
      {/* New post */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Compartilhe algo com a comunidade... 🙏"
          rows={3}
          className="w-full bg-transparent text-sm text-[#e5e5e5] placeholder-[#555] focus:outline-none resize-none mb-3"
        />
        <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-3">
          <p className="text-xs text-[#555]">{newPost.length}/500</p>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            {posting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center text-[#888] py-8">Carregando posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
              {/* Post header */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {getInitials(post.author.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{post.author.name}</p>
                    <p className="text-xs text-[#888]">
                      {post.author.niche || 'Criador Cristão'} · {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#e5e5e5] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Actions */}
              <div className="border-t border-[#1a1a1a] px-5 py-3 flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.likedByMe ? 'text-red-400' : 'text-[#888] hover:text-red-400'
                  }`}
                >
                  <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} />
                  {post.likesCount > 0 && <span>{post.likesCount}</span>}
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-[#888] hover:text-violet-400 transition-colors"
                >
                  <MessageCircle size={16} />
                  {post.comments.length > 0 && <span>{post.comments.length}</span>}
                  <span>Comentar</span>
                </button>
              </div>

              {/* Comments */}
              {expandedComments.has(post.id) && (
                <div className="border-t border-[#1a1a1a] bg-[#0d0d0d]">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3 px-5 py-3 border-b border-[#1a1a1a] last:border-b-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-violet-700 to-violet-900 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {getInitials(comment.user.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white">{comment.user.name}</p>
                          <p className="text-xs text-[#666]">{timeAgo(comment.createdAt)}</p>
                        </div>
                        <p className="text-sm text-[#e5e5e5] mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex items-center gap-3 px-5 py-3">
                    <input
                      value={commentTexts[post.id] || ''}
                      onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                      placeholder="Adicionar comentário..."
                      className="flex-1 bg-[#111111] border border-[#1f1f1f] text-sm text-[#e5e5e5] rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder-[#555]"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={!commentTexts[post.id]?.trim()}
                      className="text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <MessageCircle size={40} className="mx-auto mb-3 opacity-20" />
          <p>Nenhum post ainda. Seja o primeiro!</p>
        </div>
      )}
    </div>
  )
}
