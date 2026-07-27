'use client'

import { useEffect, useRef, useState } from 'react'

type Message = { id: string; text: string; from_login: string; created_at: string }
type User    = { login: string; nome: string; papel: string }

interface Props { user: User | null }

export default function ChatPanel({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  async function load() {
    const r = await fetch('/api/chat')
    if (r.ok) {
      const j = await r.json()
      setMessages(j.messages ?? [])
    }
  }

  useEffect(() => {
    load()
    // Polling a 5s — substituir por Supabase Realtime na Fase 2
    timerRef.current = setInterval(load, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), from_login: user.login }),
      })
      setText('')
      load()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col" style={{ height: 320 }}>
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <span className="text-base">💬</span>
        <h3 className="font-bold text-sm text-slate-800">Chat</h3>
        <span className="ml-auto text-xs text-slate-400">atualiza a cada 5s</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center pt-6">Sem mensagens ainda.</p>
        )}
        {messages.map(m => {
          const isMe = m.from_login === user?.login
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-[10px] text-slate-400 mb-0.5 px-1">{m.from_login}</span>
              )}
              <div
                className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-xs ${
                  isMe
                    ? 'text-white rounded-tr-sm'
                    : 'text-slate-800 bg-slate-100 rounded-tl-sm'
                }`}
                style={{ background: isMe ? 'var(--accent)' : undefined }}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-300 mt-0.5 px-1">
                {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 mt-3 shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Mensagem..."
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-3 py-2 rounded-lg text-xs font-bold text-white transition-all
                     disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {sending ? '...' : '↑'}
        </button>
      </form>
    </div>
  )
}
