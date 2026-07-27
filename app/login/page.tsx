'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Papel = 'professor' | 'gestao' | 'aluno'

/* ─────────────────────────── Identidades visuais ─────────────────────────── */
const THEMES = {
  professor: {
    bg:          '#0d1117',
    bgCard:      '#ffffff',
    accent:      '#1e3a8a',
    accentLight: '#dbeafe',
    ringClass:   'focus:ring-[#1e3a8a]',
    label:       'Professor',
    sublabel:    'Acesso para Docentes e Educadores',
    hint:        'Use as credenciais fornecidas pela instituição.',
    demoLogin:   'prof.rafael',
    demoSenha:   'prof123',
  },
  gestao: {
    bg:          '#100820',
    bgCard:      '#ffffff',
    accent:      '#4c1d95',
    accentLight: '#ede9fe',
    ringClass:   'focus:ring-[#4c1d95]',
    label:       'Gestão',
    sublabel:    'Acesso Administrativo e de Direção',
    hint:        'Área restrita. Acesso apenas a gestores credenciados.',
    demoLogin:   'gestao.escola',
    demoSenha:   'gestao123',
  },
  aluno: {
    bg:          'linear-gradient(145deg, #064e3b 0%, #0f766e 100%)',
    bgCard:      '#ffffff',
    accent:      '#16a34a',
    accentLight: '#dcfce7',
    ringClass:   'focus:ring-[#16a34a]',
    label:       'Aluno',
    sublabel:    'Acesso para Estudantes',
    hint:        'Bem-vindo! Entre com seu login de estudante.',
    demoLogin:   'aluno.joao',
    demoSenha:   'aluno123',
  },
} as const

/* ────────────────────────── Seleção de papel ──────────────────────────────── */
const ROLE_CARDS: { papel: Papel; icon: string; desc: string; border: string }[] = [
  {
    papel:  'professor',
    icon:   '🎓',
    desc:   'Docentes e\nEducadores',
    border: '#1e3a8a',
  },
  {
    papel:  'gestao',
    icon:   '🏛️',
    desc:   'Administração\ne Direção',
    border: '#4c1d95',
  },
  {
    papel:  'aluno',
    icon:   '📖',
    desc:   'Alunos e\nEstudantes',
    border: '#16a34a',
  },
]

/* ─────────────────────────────── Componente ───────────────────────────────── */
export default function LoginPage() {
  const [papel, setPapel]   = useState<Papel | null>(null)
  const [login, setLogin]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const theme = papel ? THEMES[papel] : null

  function selectRole(p: Papel) {
    setPapel(p)
    setLogin(THEMES[p].demoLogin)
    setSenha(THEMES[p].demoSenha)
    setErro('')
  }

  function back() {
    setPapel(null)
    setLogin('')
    setSenha('')
    setErro('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const j = await res.json()
        setErro(j.erro || 'Credenciais inválidas')
      }
    } catch {
      setErro('Sem conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  /* ── Passo 1: selecionar papel ── */
  if (!papel) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: '#08090c' }}
      >
        {/* Marca */}
        <div className="mb-12 text-center">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Portal Escolar
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">EduCalendário</h1>
          <p className="text-white/40 text-sm mt-2">Selecione seu perfil de acesso</p>
        </div>

        {/* Cards de papel */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          {ROLE_CARDS.map(({ papel: p, icon, desc, border }) => (
            <button
              key={p}
              onClick={() => selectRole(p)}
              className="flex-1 group flex flex-col items-center gap-4 px-6 py-8
                         rounded-2xl border border-white/8 text-white
                         transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = border
                ;(e.currentTarget as HTMLButtonElement).style.background = `${border}22`
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              <span className="text-4xl">{icon}</span>
              <div className="text-center">
                <div className="font-bold text-base text-white"
                  style={{ color: border }}
                >
                  {p === 'professor' ? 'Professor' : p === 'gestao' ? 'Gestão' : 'Aluno'}
                </div>
                <div className="text-white/45 text-xs mt-1 whitespace-pre-line leading-relaxed">
                  {desc}
                </div>
              </div>
              <span
                className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
                style={{ background: `${border}30`, color: border }}
              >
                Acessar →
              </span>
            </button>
          ))}
        </div>

        <p className="text-white/20 text-xs mt-12">
          EduCalendário — Portal de Comunicação Escolar
        </p>
      </div>
    )
  }

  /* ── Passo 2: formulário com tema do papel ── */
  const isProfissional = papel === 'professor' || papel === 'gestao'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-all duration-500"
      style={{ background: theme!.bg }}
    >
      <div className="w-full max-w-sm">

        {/* Voltar */}
        <button
          onClick={back}
          className="flex items-center gap-2 mb-8 text-sm transition-all"
          style={{ color: isProfissional ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isProfissional ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)' }}
        >
          ← Trocar perfil
        </button>

        {/* Header — sem emojis para professor/gestão */}
        <div className="mb-7">
          {!isProfissional && (
            <span className="text-3xl block mb-3">📖</span>
          )}
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: isProfissional ? '1.75rem' : '1.5rem',
              color: isProfissional ? '#ffffff' : '#ffffff',
              lineHeight: 1.15,
            }}
          >
            {isProfissional ? 'EduCalendário' : 'Olá, Estudante!'}
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: isProfissional ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.7)' }}
          >
            {theme!.sublabel}
          </p>
        </div>

        {/* Card do formulário */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: theme!.bgCard,
            boxShadow: isProfissional
              ? '0 24px 64px rgba(0,0,0,0.55)'
              : '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          {/* Badge de papel */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-1 h-5 rounded-full"
              style={{ background: theme!.accent }}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {theme!.label}
            </span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Login
              </label>
              <input
                value={login}
                onChange={e => setLogin(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': theme!.accent } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': theme!.accent } as React.CSSProperties}
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white text-sm transition-all
                         mt-2 disabled:opacity-60"
              style={{ background: loading ? '#94a3b8' : theme!.accent }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          {/* Hint discreto */}
          <p className="text-xs text-slate-400 mt-5 leading-relaxed">
            {theme!.hint}
          </p>
        </div>

        {/* Rodapé minimalista */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: isProfissional ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)' }}
        >
          EduCalendário — Portal Escolar
        </p>
      </div>
    </div>
  )
}
