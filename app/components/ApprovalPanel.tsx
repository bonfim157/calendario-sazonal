'use client'

import { useState } from 'react'

type Event = {
  id: string; date: string; title: string; category: string;
  status: string; nota?: string; autor_login?: string
}
type User = { login: string; nome: string; papel: string }

const CATEGORY_COLORS: Record<string, string> = {
  red: '#dc2626', yellow: '#d97706', green: '#16a34a',
  blue: '#1a73e8', purple: '#7c3aed', orange: '#ea580c',
}

interface Props {
  events: Event[]
  user: User | null
  onRefresh: () => void
}

export default function ApprovalPanel({ events, user, onRefresh }: Props) {
  const pending = events.filter(e => e.status === 'pending')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [motivos, setMotivos]     = useState<Record<string, string>>({})

  if (user?.papel !== 'gestao') return null
  if (pending.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">✅</span>
          <h3 className="font-bold text-sm text-slate-800">Aprovações</h3>
        </div>
        <p className="text-xs text-slate-400">Nenhum evento pendente.</p>
      </div>
    )
  }

  async function action(id: string, status: 'approved' | 'rejected') {
    setLoadingId(id)
    try {
      await fetch(`/api/events/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, aprovadoPor: user?.login, motivo: motivos[id] ?? '' }),
      })
      onRefresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⏳</span>
          <h3 className="font-bold text-sm text-slate-800">Pendentes de Aprovação</h3>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {pending.length}
        </span>
      </div>

      <div className="space-y-3">
        {pending.map(ev => (
          <div key={ev.id} className="border border-slate-100 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: CATEGORY_COLORS[ev.category] ?? '#94a3b8' }}
              />
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-800 truncate">{ev.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  {ev.autor_login ? ` · ${ev.autor_login}` : ''}
                </div>
                {ev.nota && <div className="text-xs text-slate-500 mt-1">{ev.nota}</div>}
              </div>
            </div>
            <input
              placeholder="Motivo (opcional)..."
              value={motivos[ev.id] ?? ''}
              onChange={e => setMotivos(m => ({ ...m, [ev.id]: e.target.value }))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg mb-2
                         focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => action(ev.id, 'approved')}
                disabled={loadingId === ev.id}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500
                           hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                ✓ Aprovar
              </button>
              <button
                onClick={() => action(ev.id, 'rejected')}
                disabled={loadingId === ev.id}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500
                           hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                ✕ Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
