type User = { nome: string; papel: string }

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const DATE_STR = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

export default function Topbar({ user }: { user: User | null }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-800">
          {GREETING()}, {user?.nome?.split(' ')[0] ?? '—'} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Portal Escolar</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-slate-700 capitalize">{DATE_STR}</div>
      </div>
    </div>
  )
}
