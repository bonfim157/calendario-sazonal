'use client'

import { useShell } from './Shell'

type User = { nome: string; papel: string }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const DATE_STR = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

export default function Topbar({ user }: { user: User | null }) {
  const { toggleDrawer } = useShell()

  return (
    <header className="flex flex-col shrink-0 bg-white border-b border-slate-100">
      {/* Faixa de acento colorida por papel */}
      <div className="h-0.5 w-full" style={{ background: 'var(--accent)' }} aria-hidden="true" />

      <div className="flex items-center gap-3 px-4 md:px-6 py-3.5">
        {/* Botão hambúrguer — visível apenas no mobile */}
        <button
          onClick={toggleDrawer}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg
                     text-slate-600 hover:bg-slate-100 active:bg-slate-200
                     transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Abrir menu de navegação"
        >
          {/* Ícone hambúrguer com animação suave */}
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all duration-200" />
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all duration-200" />
          <span className="block w-5 h-0.5 bg-current transition-all duration-200" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-slate-800 truncate">
            {greeting()}, {user?.nome?.split(' ')[0] ?? '—'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 capitalize hidden sm:block">{DATE_STR}</p>
        </div>

        <div
          className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          {user?.papel === 'professor' ? 'Professor'
            : user?.papel === 'gestao' ? 'Gestão'
            : user?.papel === 'aluno' ? 'Aluno'
            : '—'}
        </div>
      </div>
    </header>
  )
}
