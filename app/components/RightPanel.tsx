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

  useEffect(() => {
    fetch('/api/schedule').then(r => r.json()).then(j => setSchedules(j.schedules ?? []))
  }, [])

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <aside className="w-80 shrink-0 h-full overflow-y-auto border-l border-slate-100 bg-slate-50/50">
      {/* Tab selector */}
      <div className="flex border-b border-slate-100 bg-white px-2 pt-3">
        {(['overview', 'horarios'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      <div className="p-4 space-y-4">
        {activeTab === 'overview' ? (
          <>
            {/* Approval panel — gestão only */}
            <ApprovalPanel events={events} user={user} onRefresh={onRefresh} />

            {/* Recent events */}
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

            {/* Chat */}
            <ChatPanel user={user} />
          </>
        ) : (
          <ScheduleView schedules={schedules} />
        )}
      </div>
    </aside>
  )
}
