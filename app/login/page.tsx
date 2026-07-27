'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_ACCOUNTS = [
  { login: 'prof.rafael',   senha: 'prof123',   label: 'Professor',  color: '#1e3a8a' },
  { login: 'aluno.joao',    senha: 'aluno123',  label: 'Aluno',      color: '#14532d' },
  { login: 'gestao.escola', senha: 'gestao123', label: 'Gestão',     color: '#4c1d95' },
]

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
        setErro(j.erro || 'Erro no login')
      }
    } catch {
      setErro('Sem conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setLogin(acc.login)
    setSenha(acc.senha)
    setErro('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-4xl">📚</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">EduCalendário</span>
          </div>
          <p className="text-white/70 text-sm">Portal Escolar — Acesso seguro</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
          <h1 className="text-xl font-bold text-slate-800 mb-6">Entrar na sua conta</h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Login
              </label>
              <input
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="ex: prof.rafael"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
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
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white text-sm transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#94a3b8' : '#1a73e8' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Contas demo */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Contas de demonstração
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.login}
                  onClick={() => fillDemo(acc)}
                  className="text-xs py-2 px-3 rounded-lg font-semibold text-white transition-all
                             hover:opacity-90 active:scale-95"
                  style={{ background: acc.color }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Clique para preencher automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
