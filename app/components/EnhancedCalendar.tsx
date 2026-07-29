'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDesignSystem } from '@/lib/theme-provider'
import EventModal from './EventModal'

type Event = {
  id: string
  date: string
  title: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  nota?: string
  autor_login?: string
  hora?: string
  local?: string
}

type User = { 
  login: string
  nome: string
  papel: 'professor' | 'aluno' | 'gestao'
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  red:    { light: '#FEE2E2', dark: '#991B1B' },      // Urgente
  yellow: { light: '#FEF3C7', dark: '#92400E' },      // Avaliação
  green:  { light: '#D1FAE5', dark: '#065F46' },      // Atividade
  blue:   { light: '#DBEAFE', dark: '#1E40AF' },     // Informativo
  purple: { light: '#EDE9FE', dark: '#5B21B6' },     // Cultural
  orange: { light: '#FFEDD5', dark: '#9A3412' },     // Outros
}

interface EnhancedCalendarProps {
  events: Event[]
  user: User | null
  onEventCreated: () => void
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayString(): string {
  const today = new Date()
  return formatDate(today.getFullYear(), today.getMonth(), today.getDate())
}

export default function EnhancedCalendar({ events, user, onEventCreated }: EnhancedCalendarProps) {
  const { colors, cn, getColor } = useDesignSystem()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  
  const today = todayString()
  const canCreate = user?.papel === 'professor' || user?.papel === 'gestao'

  // Calcular células do calendário
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const cells: (null | { day: number; date: string })[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        date: formatDate(currentYear, currentMonth, i + 1),
      })),
    ]
    
    return cells
  }, [currentYear, currentMonth])

  // Navegação entre meses
  const navigatePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const navigateNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  // Filtrar eventos visíveis para o usuário atual
  const getVisibleEvents = (date: string): Event[] => {
    const dateEvents = events.filter(ev => ev.date === date)
    
    if (user?.papel === 'aluno') {
      // Alunos só veem eventos aprovados
      return dateEvents.filter(ev => ev.status === 'approved')
    }
    
    return dateEvents
  }

  // Expandir/collapsar data
  const toggleExpandDate = (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null)
    } else {
      setExpandedDate(date)
    }
  }

  // Renderizar badge de contador de eventos
  const renderEventBadge = (count: number) => {
    if (count === 0) return null
    
    return (
      <span className={cn(
        "absolute -top-1.5 -right-1.5",
        "w-5 h-5 rounded-full text-xs font-bold",
        "flex items-center justify-center",
        "bg-primary-500 text-white",
        "shadow-sm"
      )}>
        {count}
      </span>
    )
  }

  // Renderizar lista de eventos para uma data
  const renderEventList = (dateEvents: Event[], date: string) => {
    const isExpanded = expandedDate === date
    const showCount = 3 // Mostrar até 3 eventos sem expandir
    
    return (
      <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
        {dateEvents.slice(0, isExpanded ? undefined : showCount).map(event => (
          <div
            key={event.id}
            className={cn(
              "text-xs px-1.5 py-0.5 rounded truncate",
              "transition-all duration-150",
              event.status === 'pending' ? 'opacity-70' : 'opacity-100'
            )}
            style={{
              backgroundColor: CATEGORY_COLORS[event.category]?.light || colors.muted,
              color: CATEGORY_COLORS[event.category]?.dark || colors.foreground,
            }}
            title={`${event.title}${event.nota ? '\n' + event.nota : ''}${event.hora ? '\nHora: ' + event.hora : ''}${event.local ? '\nLocal: ' + event.local : ''}`}
          >
            <div className="flex items-center gap-1">
              {event.status === 'pending' && <span className="text-xs">⏳</span>}
              <span className="font-semibold truncate">{event.title}</span>
            </div>
          </div>
        ))}
        
        {dateEvents.length > showCount && !isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpandDate(date)
            }}
            className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors w-full text-left"
          >
            +{dateEvents.length - showCount} mais eventos
          </button>
        )}
        
        {isExpanded && dateEvents.length > showCount && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpandDate(date)
            }}
            className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors w-full text-left"
          >
            ↑ Mostrar menos
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Header do calendário */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Controles de navegação */}
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrevMonth}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors font-bold",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Mês anterior"
          >
            ‹
          </button>
          
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground min-w-48 text-center">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={navigateNextMonth}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors font-bold",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        {/* Modos de visualização */}
        <div className="flex items-center gap-2 ml-0 sm:ml-auto">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === 'month' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === 'week' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Semana
            </button>
          </div>

          {canCreate && (
            <button
              onClick={() => setModalDate(today)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 active:scale-95 transition-all",
                "shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              + Novo Evento
            </button>
          )}
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {DAYS.map(day => (
          <div 
            key={day} 
            className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-1.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="min-h-24" />
          }
          
          const dateEvents = getVisibleEvents(cell.date)
          const isToday = cell.date === today
          const isExpanded = expandedDate === cell.date
          
          return (
            <div
              key={cell.date}
              onClick={() => canCreate && setModalDate(cell.date)}
              className={cn(
                "min-h-24 rounded-lg p-1.5 md:p-2 transition-all border",
                "relative group",
                isToday
                  ? "bg-primary/5 border-primary/20 shadow-[0_0_0_2px_var(--accent)]"
                  : "bg-card border-border hover:border-primary/30 hover:shadow-sm",
                canCreate ? "cursor-pointer hover:bg-muted/50" : "",
                isExpanded ? "bg-muted/30" : ""
              )}
            >
              {/* Número do dia com badge de contador */}
              <div className="relative inline-block">
                <span
                  className={cn(
                    "text-xs font-bold block mb-1",
                    isToday ? "text-primary font-extrabold" : "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </span>
                {renderEventBadge(dateEvents.length)}
              </div>

              {/* Lista de eventos */}
              {dateEvents.length > 0 && renderEventList(dateEvents, cell.date)}

              {/* Botão para adicionar mais eventos (sempre visível se puder criar) */}
              {canCreate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setModalDate(cell.date)
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    "text-xs bg-success text-white mt-1",
                    "hover:bg-success/90 transition-colors",
                    "opacity-0 group-hover:opacity-100",
                    "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-success"
                  )}
                  aria-label={`Adicionar evento em ${cell.day}/${currentMonth + 1}`}
                  title="Adicionar evento"
                >
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda das categorias */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
        {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color.light, border: `1px solid ${color.dark}` }}
            />
            <span className="capitalize">
              {key === 'red' ? 'urgente' : 
               key === 'yellow' ? 'avaliação' : 
               key === 'green' ? 'atividade' : 
               key === 'blue' ? 'informativo' : 
               key === 'purple' ? 'cultural' : 'outros'}
            </span>
          </div>
        ))}
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>⏳</span>
          <span>pendente de aprovação</span>
        </div>
      </div>

      {/* Contador de eventos totais */}
      <div className="mt-4 text-sm text-muted-foreground">
        Total de eventos este mês: <span className="font-semibold text-foreground">
          {events.filter(ev => {
            const eventDate = new Date(ev.date)
            return eventDate.getFullYear() === currentYear && 
                   eventDate.getMonth() === currentMonth
          }).length}
        </span>
      </div>

      {/* Modal para criar/editar eventos */}
      {modalDate && canCreate && (
        <EventModal
          date={modalDate}
          user={user}
          onClose={() => setModalDate(null)}
          onCreated={() => { 
            setModalDate(null)
            setExpandedDate(null)
            onEventCreated() 
          }}
        />
      )}
    </div>
  )
}