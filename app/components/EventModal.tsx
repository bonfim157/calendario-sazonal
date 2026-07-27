'use client'

import { useState } from 'react'

type User = { login: string; nome: string; papel: string }

const CATEGORIES = [
  { value: 'red',    label: 'Urgente',     color: '#dc2626' },
  { value: 'yellow', label: 'Avaliação',   color: '#d97706' },
  { value: 'green',  label: 'Atividade',   color: '#16a34a' },
  { value: 'blue',   label: 'Informativo', color: '#1a73e8' },
  { value: 'purple', label: 'Cultural',    color: '#7c3aed' },
  { value: 'orange', label: 'Outros',      color: '#ea580c' },
]

interface Props {
  date: string
  user: User | null
  onClose: () => void
  onCreated: () => void
}

export default function EventModal({ date, user, onClose, onCreated }: Props) {
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('blue')
  const [nota, setNota]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [erro, setErro]         = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title, category, nota, autor_login: user?.login }),
      })
      if (res.ok) {
        onCreated()
      } else {
        const j = await res.json()
        setErro(j.erro || 'Erro ao criar evento')
      }
    } catch {
      setErro('Sem conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const dateFmt = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-[0_20px_60px_rgba(0,0,0,.3)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Novo Evento</h2>
            <p className="text-sm text-slate-400 capitalize mt-0.5">{dateFmt}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center
                       text-slate-400 transition-colors text-lg"
          >×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Prova de Matemática"
              required
              maxLength={200}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all
                             border-2"
                  style={{
                    background: cat.color,
                    borderColor: category === cat.value ? 'white' : 'transparent',
                    boxShadow: category === cat.value ? `0 0 0 2px ${cat.color}` : 'none',
                    opacity: category === cat.value ? 1 : 0.65,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Observações <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {user?.papel === 'professor' && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⏳ Seu evento ficará pendente até a gestão aprovar.
            </p>
          )}

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600
                         bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all
                         disabled:opacity-60"
              style={{ background: '#1a73e8' }}
            >
              {loading ? 'Salvando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
