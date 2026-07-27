'use client'

import { useRouter } from 'next/navigation'

type User = { login: string; nome: string; papel: 'professor' | 'aluno' | 'gestao' }

const SIDEBAR_COLORS: Record<string, string> = {
  professor: '#1e3a8a',
  aluno:     '#14532d',
  gestao:    '#4c1d95',
}

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
  const bg = user ? (SIDEBAR_COLORS[user.papel] ?? '#1e3a8a') : '#1e3a8a'
  const initials = user ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : '—'

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navItems = user?.papel === 'gestao'
    ? [...NAV_ITEMS, GESTAO_NAV]
    : NAV_ITEMS

  return (
    <aside
      className="flex flex-col w-64 shrink-0 h-full text-white"
      style={{ background: bg }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <div className="font-extrabold text-base leading-tight">EduCalendário</div>
            <div className="text-white/50 text-xs">Portal Escolar</div>
          </div>
        </div>
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
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeView
            ? item.href.includes(activeView)
            : item.href === '/dashboard'
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         transition-all text-left"
              style={{
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-white/65 hover:text-white hover:bg-white/10 transition-all"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
