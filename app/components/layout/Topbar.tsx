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
  return (
    <div className="flex flex-col shrink-0 bg-white border-b border-slate-100">
      {/* Faixa de acento colorida por papel */}
      <div className="h-0.5 w-full" style={{ background: 'var(--accent)' }} />

      <div className="flex items-center justify-between px-6 py-3.5">
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {greeting()}, {user?.nome?.split(' ')[0] ?? '—'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{DATE_STR}</p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          {user?.papel === 'professor' ? 'Professor'
            : user?.papel === 'gestao' ? 'Gestão'
            : user?.papel === 'aluno' ? 'Aluno'
            : '—'}
        </div>
      </div>
    </div>
  )
}
