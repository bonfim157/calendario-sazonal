'use client'

import { useRouter } from 'next/navigation'

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
      style={{ background: '#111827' }}
    >
      {/* Tira de acento no topo — identifica o papel sem dominar */}
      <div className="h-0.5 w-full shrink-0" style={{ background: 'var(--accent)' }} />

      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            E
          </div>
          <div>
            <div className="font-extrabold text-sm leading-tight">EduCalendário</div>
            <div className="text-white/35 text-[11px]">Portal Escolar</div>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div className="px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
            style={{ background: 'var(--accent)', opacity: 0.85 }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate text-white/90">{user?.nome ?? '—'}</div>
            <div className="text-white/40 text-xs">{user ? PAPEL_LABEL[user.papel] : '—'}</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeView
            ? item.href.includes(activeView)
            : item.href === '/dashboard'
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                         transition-all text-left"
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                boxShadow: isActive ? 'inset 3px 0 0 var(--accent)' : 'none',
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-white/8">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-white/40 hover:text-white/80 hover:bg-white/05 transition-all"
        >
          <span className="text-base">🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
