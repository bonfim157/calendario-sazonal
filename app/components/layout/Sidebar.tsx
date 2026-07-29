'use client'

import { useRouter } from 'next/navigation'
import { useShell } from './Shell'

type User = { login: string; nome: string; papel: 'professor' | 'aluno' | 'gestao' }

const PAPEL_LABEL: Record<string, string> = {
  professor: 'Professor',
  aluno:     'Aluno',
  gestao:    'Gestão',
}

const NAV_ITEMS = [
  { icon: '🗓️', label: 'Calendário', href: '/dashboard' },
  { icon: '📋', label: 'Eventos',    href: '/dashboard?view=eventos' },
  { icon: '💬', label: 'Chat',       href: '/dashboard?view=chat' },
  { icon: '📊', label: 'Horários',   href: '/dashboard?view=horarios' },
]

const GESTAO_NAV = { icon: '📈', label: 'Métricas', href: '/dashboard/metrics' }

interface Props {
  user: User | null
  activeView?: string
}

export default function Sidebar({ user, activeView }: Props) {
  const router = useRouter()
  const { drawerOpen, closeDrawer } = useShell()
  const initials = user ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : '—'

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function navigate(href: string) {
    router.push(href)
    closeDrawer() // Fecha o drawer após navegar no mobile
  }

  const navItems = user?.papel === 'gestao'
    ? [...NAV_ITEMS, GESTAO_NAV]
    : NAV_ITEMS

  return (
    <>
      {/*
        Desktop: sidebar estática (visível a partir de md:)
        Mobile:  drawer deslizante controlado pelo ShellContext
      */}
      <aside
        className={[
          // Layout base
          'flex flex-col w-64 shrink-0 h-full text-white z-50',
          // Desktop: sempre visível
          'md:relative md:translate-x-0',
          // Mobile: posição fixa, drawer
          'fixed inset-y-0 left-0',
          // Animação de deslize mobile
          drawerOpen
            ? 'translate-x-0 animate-slideInLeft'
            : '-translate-x-full',
          // No desktop, anular o translate negativo
          'md:translate-x-0',
          // Transição suave
          'transition-transform duration-300 ease-material',
        ].join(' ')}
        style={{ background: 'var(--accent)' }}
        aria-label="Menu de navegação"
        aria-hidden={!drawerOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'true' : undefined}
      >
        {/* Brand + botão fechar no mobile */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📚</span>
            <div>
              <div className="font-extrabold text-sm leading-tight">EduCalendário</div>
              <div className="text-white/35 text-[11px]">Portal Escolar</div>
            </div>
          </div>
          {/* Botão fechar — visível apenas no mobile */}
          <button
            onClick={closeDrawer}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg
                       text-white/60 hover:text-white hover:bg-white/10
                       transition-colors active:scale-90"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* User pill */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{user?.nome ?? '—'}</div>
              <div className="text-white/60 text-xs">{user ? PAPEL_LABEL[user.papel] : '—'}</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" aria-label="Online" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegação principal">
          {navItems.map((item, idx) => {
            const isActive = activeView
              ? item.href.includes(activeView)
              : item.href === '/dashboard'
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-3 rounded-xl text-sm font-medium
                           transition-all duration-200 text-left
                           hover:bg-white/15 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40
                           animate-stagger"
                style={{
                  // Touch target mínimo 44px
                  minHeight: '44px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                  boxShadow: isActive ? 'inset 3px 0 0 rgba(255,255,255,0.7)' : 'none',
                  // Stagger de entrada
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 rounded-xl text-sm font-medium
                       text-white/65 hover:text-white hover:bg-white/10
                       transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40"
            style={{ minHeight: '44px', paddingTop: '10px', paddingBottom: '10px' }}
          >
            <span aria-hidden="true">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
