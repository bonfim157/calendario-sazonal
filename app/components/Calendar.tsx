'use client'

import { useState } from 'react'
import EventModal from './EventModal'

type Event = {
  id: string; date: string; title: string; category: string;
  status: 'pending' | 'approved' | 'rejected'; nota?: string; autor_login?: string
}
type User = { login: string; nome: string; papel: string }

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const CATEGORY_COLORS: Record<string, string> = {
  red:    '#dc2626', yellow: '#d97706', green:  '#16a34a',
  blue:   '#1a73e8', purple: '#7c3aed', orange: '#ea580c',
}

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
function todayStr() {
  const t = new Date()
  return fmt(t.getFullYear(), t.getMonth(), t.getDate())
}

interface Props {
  events: Event[]
  user: User | null
  onEventCreated: () => void
}

export default function Calendar({ events, user, onEventCreated }: Props) {
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [modalDate, setModalDate] = useState<string | null>(null)

  const today = todayStr()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build grid cells
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (null | { day: number; date: string })[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: fmt(year, month, i + 1),
    })),
  ]

  const canCreate = user?.papel === 'professor' || user?.papel === 'gestao'

  function visibleEvents(date: string) {
    return events.filter(ev => {
      if (ev.date !== date) return false
      if (user?.papel === 'aluno') return ev.status === 'approved'
      return true
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Month nav */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500
                     hover:bg-slate-100 transition-colors font-bold"
        >‹</button>
        <h2 className="text-xl font-extrabold text-slate-800 min-w-48 text-center">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500
                     hover:bg-slate-100 transition-colors font-bold"
        >›</button>
        <div className="ml-auto">
          {canCreate && (
            <button
              onClick={() => setModalDate(today)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all
                         hover:opacity-90 active:scale-95"
              style={{ background: '#1a73e8' }}
            >
              + Novo Evento
            </button>
          )}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const dayEvs = visibleEvents(cell.date)
          const isToday = cell.date === today
          return (
            <div
              key={i}
              onClick={() => canCreate && setModalDate(cell.date)}
              className={`min-h-24 rounded-xl p-2 transition-all border
                ${isToday
                  ? 'bg-blue-50 border-blue-200 shadow-[0_0_0_2px_#1a73e8]'
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}
                ${canCreate ? 'cursor-pointer' : ''}
              `}
            >
              <span className={`text-xs font-bold block mb-1.5 ${
                isToday ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {cell.day}
              </span>
              <div className="space-y-1">
                {dayEvs.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    title={`${ev.title}${ev.nota ? '\n' + ev.nota : ''}`}
                    className="text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate"
                    style={{
                      background: CATEGORY_COLORS[ev.category] ?? '#64748b',
                      opacity: ev.status === 'pending' ? 0.6 : 1,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {ev.status === 'pending' && '⏳ '}
                    {ev.title}
                  </div>
                ))}
                {dayEvs.length > 3 && (
                  <div className="text-[10px] text-slate-400 px-1">+{dayEvs.length - 3} mais</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-100">
        {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="capitalize">{key === 'red' ? 'urgente' : key === 'yellow' ? 'avaliação' : key === 'green' ? 'atividade' : key === 'blue' ? 'informativo' : key === 'purple' ? 'cultural' : 'outros'}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>⏳</span><span>pendente de aprovação</span>
        </div>
      </div>

      {modalDate && canCreate && (
        <EventModal
          date={modalDate}
          user={user}
          onClose={() => setModalDate(null)}
          onCreated={() => { setModalDate(null); onEventCreated() }}
        />
      )}
    </div>
  )
}
