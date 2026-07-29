'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Papel = 'professor' | 'gestao' | 'aluno'

const BG_SELECTOR = '#08090c'

const THEMES = {
  professor: {
    bg:          '#0d1117',
    accent:      '#1e3a8a',
    label:       'Professor',
    sublabel:    'Acesso para Docentes e Educadores',
    hint:        'Use as credenciais fornecidas pela instituição.',
    demoLogin:   'prof.rafael',
    demoSenha:   'prof123',
    professional: true,
  },
  gestao: {
    bg:          '#0b0618',
    accent:      '#4c1d95',
    label:       'Gestão',
    sublabel:    'Acesso Administrativo e de Direção',
    hint:        'Área restrita. Acesso apenas a gestores credenciados.',
    demoLogin:   'gestao.escola',
    demoSenha:   'gestao123',
    professional: true,
  },
  aluno: {
    bg:          '#052e16',
    accent:      '#16a34a',
    label:       'Aluno',
    sublabel:    'Acesso para Estudantes',
    hint:        'Bem-vindo! Entre com seu login de estudante.',
    demoLogin:   'aluno.joao',
    demoSenha:   'aluno123',
    professional: false,
  },
} as const

const ROLE_CARDS = [
  { papel: 'professor' as const, icon: '🎓', desc: 'Docentes e\nEducadores',   border: '#1e3a8a' },
  { papel: 'gestao'    as const, icon: '🏛️', desc: 'Administração\ne Direção', border: '#4c1d95' },
  { papel: 'aluno'     as const, icon: '📖', desc: 'Alunos e\nEstudantes',     border: '#16a34a' },
]

export default function LoginPage() {
  const [papel, setPapel]       = useState<Papel | null>(null)
  const [visible, setVisible]   = useState(true)
  const [login, setLogin]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const currentBg = papel ? THEMES[papel].bg : BG_SELECTOR
  const theme = papel ? THEMES[papel] : null

  function fade(fn: () => void) {
    setVisible(false)
    setTimeout(() => { fn(); setVisible(true) }, 180)
  }

  function selectRole(p: Papel) {
    fade(() => {
      setPapel(p)
      setLogin(THEMES[p].demoLogin)
      setSenha(THEMES[p].demoSenha)
      setErro('')
    })
  }

  function back() {
    fade(() => {
      setPapel(null)
      setLogin('')
      setSenha('')
      setErro('')
    })
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: currentBg,
        transition: 'background-color 0.35s ease',
      }}
    >
      <div
        className="flex flex-col items-center w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        {!papel ? (
          /* ── Seletor de papel ── */
          <>
            <div className="mb-12 text-center animate-fadeSlideDown">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Portal Escolar
              </p>
              <h1 className="text-4xl font-black text-white tracking-tight">EduCalendário</h1>
              <p className="text-white/40 text-sm mt-2">Selecione seu perfil de acesso</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              {ROLE_CARDS.map(({ papel: p, icon, desc, border }, idx) => (
                <button
                  key={p}
                  onClick={() => selectRole(p)}
                  className="flex-1 flex flex-col items-center gap-4 px-6 py-8 rounded-2xl
                             text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             animate-fadeSlideUp"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    // Stagger de entrada: 0ms, 80ms, 160ms
                    animationDelay: `${idx * 80}ms`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = border
                    el.style.background  = `${border}22`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(255,255,255,0.08)'
                    el.style.background  = 'rgba(255,255,255,0.04)'
                  }}
                >
                  <span className="text-4xl">{icon}</span>
                  <div className="text-center">
                    <div className="font-bold text-base" style={{ color: border }}>
                      {p === 'professor' ? 'Professor' : p === 'gestao' ? 'Gestão' : 'Aluno'}
                    </div>
                    <div className="text-white/45 text-xs mt-1 whitespace-pre-line leading-relaxed">
                      {desc}
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-4 py-1.5 rounded-full"
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
          </>
        ) : (
          /* ── Formulário temático ── */
          <div className="w-full max-w-sm animate-fadeSlideUp">
            <button
              onClick={back}
              className="flex items-center gap-2 mb-8 text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', minHeight: '44px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
            >
              ← Trocar perfil
            </button>

            <div className="mb-7">
              {!theme!.professional && (
                <span className="text-3xl block mb-3">📖</span>
              )}
              <h1
                className="font-black tracking-tight text-white"
                style={{
                  fontSize: theme!.professional ? '1.75rem' : '1.5rem',
                  lineHeight: 1.15,
                }}
              >
                {theme!.professional ? 'EduCalendário' : 'Olá, Estudante!'}
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {theme!.sublabel}
              </p>
            </div>

            <div
              className="rounded-2xl p-7 bg-white"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full" style={{ background: theme!.accent }} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {theme!.label}
                </span>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Login</label>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
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
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg animate-shake">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-white text-sm
                             transition-all mt-2 disabled:opacity-60
                             flex items-center justify-center gap-2"
                  style={{ background: loading ? '#94a3b8' : theme!.accent, minHeight: '44px' }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              <p className="text-xs text-slate-400 mt-5 leading-relaxed">{theme!.hint}</p>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
              EduCalendário — Portal Escolar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
