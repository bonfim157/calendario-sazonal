'use client'

import { useEffect, useState } from 'react'
import ApprovalPanel from './ApprovalPanel'
import ChatPanel from './ChatPanel'
import ScheduleView from './ScheduleView'

type User = { login: string; nome: string; papel: string }
type Event = {
  id: string; date: string; title: string; category: string;
  status: string; nota?: string; autor_login?: string
}
type Schedule = { id: string; turma: string; dia: number; slot: number; disciplina: string }

const CATEGORY_COLORS: Record<string, string> = {
  red: '#dc2626', yellow: '#d97706', green: '#16a34a',
  blue: '#1a73e8', purple: '#7c3aed', orange: '#ea580c',
}

interface Props {
  user: User | null
  events: Event[]
  onRefresh: () => void
}

export default function RightPanel({ user, events, onRefresh }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'horarios'>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/schedule').then(r => r.json()).then(j => setSchedules(j.schedules ?? []))
  }, [])

  // Fechar com Escape no mobile
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const panelContent = (
    <>
      {/* Tab selector */}
      <div className="flex border-b border-slate-100 bg-white px-2 pt-3 shrink-0">
        {(['overview', 'horarios'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ minHeight: '44px' }}
            className={`flex-1 text-xs font-bold pb-2.5 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'overview' ? '📋 Visão Geral' : '📊 Horários'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' ? (
          <>
            <ApprovalPanel events={events} user={user} onRefresh={onRefresh} />

            <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📅</span>
                <h3 className="font-bold text-sm text-slate-800">Próximos Eventos</h3>
              </div>
              {recentEvents.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum evento cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map(ev => (
                    <div key={ev.id} className="flex items-start gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: CATEGORY_COLORS[ev.category] ?? '#94a3b8' }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{ev.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {ev.status === 'pending' && (
                            <span className="ml-1 text-amber-500 font-semibold">• pendente</span>
                          )}
                          {ev.status === 'rejected' && (
                            <span className="ml-1 text-red-500 font-semibold">• rejeitado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ChatPanel user={user} />
          </>
        ) : (
          <ScheduleView schedules={schedules} />
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── DESKTOP: sidebar fixa à direita ── */}
      <aside className="hidden md:flex flex-col w-80 shrink-0 h-full border-l border-slate-100 bg-slate-50/50">
        {panelContent}
      </aside>

      {/* ── MOBILE: botão flutuante + bottom sheet ── */}
      <div className="md:hidden">
        {/* Botão flutuante para abrir painel */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full shadow-lg
                       bg-[var(--accent)] text-white text-xl
                       flex items-center justify-center
                       active:scale-95 transition-transform animate-fadeIn"
            aria-label="Abrir painel de informações"
          >
            📋
          </button>
        )}

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 animate-fadeIn"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Bottom sheet */}
        {mobileOpen && (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col
                       bg-slate-50 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)]
                       animate-slideInUp"
            style={{ maxHeight: '80vh' }}
          >
            {/* Handle + botão fechar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           text-slate-400 hover:bg-slate-200 transition-colors ml-auto"
                aria-label="Fechar painel"
              >
                ✕
              </button>
            </div>
            {panelContent}
          </div>
        )}
      </div>
    </>
  )
}
