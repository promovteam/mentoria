'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Bot, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-violet-300">$1</em>')
    .replace(/^### (.*)/gm, '<h4 class="text-white font-bold text-sm mt-4 mb-1.5">$1</h4>')
    .replace(/^## (.*)/gm, '<h3 class="text-white font-bold text-base mt-4 mb-2">$1</h3>')
    .replace(/^# (.*)/gm, '<h2 class="text-white font-bold text-lg mt-4 mb-2">$1</h2>')
    .replace(/^(\d+)\. (.*)/gm, '<div class="flex gap-2 my-1"><span class="text-violet-400 font-bold min-w-[20px]">$1.</span><span>$2</span></div>')
    .replace(/^[-•] (.*)/gm, '<div class="flex gap-2 my-1"><span class="text-violet-400">→</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

const SUGGESTIONS = [
  'Analise meu roteiro e melhore o hook',
  'Gere ideias para o meu nicho',
  'Qual formato usar para falar de oração?',
  'Escreva uma legenda para o meu próximo post',
]

const MAPPING_FIRST_MESSAGE = `Olá! Antes de começar, quero entender melhor você e o seu público para que eu possa gerar conteúdos realmente personalizados.

Vou fazer algumas perguntas rápidas — pode responder com calma, do seu jeito.

Para começar: **quem é a pessoa que você quer impactar com seu conteúdo?** Descreva o seu avatar — pode falar sobre idade, gênero, momento de fé, estilo de vida... quanto mais detalhe, melhor! 🙏`

export default function IAChat({ firstName, hasAvatarMapping }: { firstName: string; hasAvatarMapping: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'idle' | 'mapping' | 'chat'>(
    hasAvatarMapping ? 'idle' : 'idle'
  )
  const [mappingCompleted, setMappingCompleted] = useState(hasAvatarMapping)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isEmpty = messages.length === 0 && mode === 'idle'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Start avatar mapping automatically
  function startMapping() {
    const firstMsg: Message = { role: 'assistant', content: MAPPING_FIRST_MESSAGE }
    setMessages([firstMsg])
    setMode('mapping')
  }

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMessage: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      if (mode === 'mapping') {
        // Avatar mapping mode
        const res = await fetch('/api/ai/avatar-mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, userName: firstName }),
        })
        const data = await res.json()
        const assistantMsg: Message = { role: 'assistant', content: data.result || 'Ocorreu um erro.' }
        setMessages(prev => [...prev, assistantMsg])

        if (data.completed) {
          setMappingCompleted(true)
          setMode('chat')
          // Add transition message after a short delay
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '✅ **Avatar mapeado com sucesso!** A partir de agora, todos os roteiros e conteúdos que eu gerar serão personalizados para o seu público específico.\n\nComo posso te ajudar hoje?'
            }])
          }, 500)
        }
      } else {
        // Normal chat mode
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        })
        const data = await res.json()
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.result || data.error || 'Ocorreu um erro.',
        }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function startChat(suggestion?: string) {
    setMode('chat')
    if (suggestion) sendMessage(suggestion)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Reset */}
      {mode !== 'idle' && (
        <div className="absolute top-4 right-6 z-10">
          <button
            onClick={() => { setMessages([]); setMode('idle') }}
            className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#aaa] px-3 py-1.5 rounded-lg hover:bg-[#111] transition-all"
          >
            <RotateCcw size={12} />
            Nova conversa
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full pb-32 px-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-violet-500/20">
              <Bot size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {getGreeting()}, {firstName}
            </h1>

            {!mappingCompleted ? (
              /* First time — prompt mapping */
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <p className="text-[#666] text-sm">
                  Para gerar conteúdos personalizados, preciso entender você e seu público primeiro.
                </p>
                <button
                  onClick={startMapping}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-violet-500/20"
                >
                  <Sparkles size={16} />
                  Mapear meu avatar agora
                </button>
                <button
                  onClick={() => startChat()}
                  className="text-xs text-[#555] hover:text-[#888] transition-colors"
                >
                  Pular por agora
                </button>
              </div>
            ) : (
              /* Has mapping — show suggestions */
              <div className="flex flex-col items-center gap-4 max-w-lg">
                <p className="text-[#555] text-xs flex items-center gap-1.5">
                  <Sparkles size={11} className="text-violet-500" />
                  Avatar mapeado · respostas personalizadas para o seu público
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => startChat(s)}
                      className="text-sm text-[#888] border border-[#1f1f1f] px-4 py-2 rounded-full hover:text-white hover:border-violet-500/40 hover:bg-[#111] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-2xl mx-auto w-full px-4 pt-12 pb-6 space-y-8">
            {/* Mapping banner */}
            {mode === 'mapping' && (
              <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-2.5">
                <Sparkles size={12} />
                Mapeamento de avatar em andamento — suas respostas ficam salvas e personalizam a IA
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 rounded-2xl rounded-tr-sm'
                    : 'text-[#ccc]'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5 py-2">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {(mode !== 'idle') && (
        <div className="flex-shrink-0 px-4 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl px-4 py-3.5 flex items-end gap-3 focus-within:border-violet-500/40 transition-colors shadow-xl shadow-black/40">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'mapping' ? 'Responda aqui...' : 'Mensagem...'}
                rows={1}
                className="flex-1 bg-transparent text-[#e5e5e5] text-sm placeholder-[#444] focus:outline-none resize-none leading-relaxed"
                style={{ maxHeight: '160px' }}
                autoFocus
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-violet-600 hover:bg-violet-500 disabled:bg-[#1a1a1a] disabled:text-[#333] text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="text-xs text-[#333] text-center mt-2">Enter para enviar · Shift+Enter para nova linha</p>
          </div>
        </div>
      )}

      {/* Input shown on idle screen too (for mapped users) */}
      {mode === 'idle' && mappingCompleted && (
        <div className="flex-shrink-0 px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl px-4 py-3.5 flex items-end gap-3 focus-within:border-violet-500/40 transition-colors shadow-xl shadow-black/40">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize() }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim()) { setMode('chat'); sendMessage() }
                  }
                }}
                placeholder="Como posso te ajudar hoje?"
                rows={1}
                className="flex-1 bg-transparent text-[#e5e5e5] text-sm placeholder-[#444] focus:outline-none resize-none leading-relaxed"
                style={{ maxHeight: '160px' }}
              />
              <button
                onClick={() => { if (input.trim()) { setMode('chat'); sendMessage() } }}
                disabled={!input.trim()}
                className="w-8 h-8 bg-violet-600 hover:bg-violet-500 disabled:bg-[#1a1a1a] disabled:text-[#333] text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
