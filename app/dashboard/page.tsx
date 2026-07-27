'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Shell from '@/app/components/layout/Shell'
import Sidebar from '@/app/components/layout/Sidebar'
import Topbar from '@/app/components/layout/Topbar'
import Calendar from '@/app/components/Calendar'
import RightPanel from '@/app/components/RightPanel'

type User  = { login: string; nome: string; papel: 'professor' | 'aluno' | 'gestao' }
type Event = {
  id: string; date: string; title: string; category: string;
  status: 'pending' | 'approved' | 'rejected'; nota?: string; autor_login?: string
}

export default function DashboardPage() {
  const [user, setUser]       = useState<User | null>(null)
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const r = await fetch('/api/auth/validate')
      if (!r.ok) { router.push('/login'); return }
      const j = await r.json()
      setUser(j.user)
      await loadEvents()
      setLoading(false)
    }
    init()
  }, [])

  async function loadEvents() {
    const r = await fetch('/api/events')
    if (r.ok) {
      const j = await r.json()
      setEvents(j.events ?? [])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-slate-500 text-sm font-medium">Carregando EduCalendário...</p>
        </div>
      </div>
    )
  }

  return (
    <Shell role={user?.papel}>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={user} />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Calendar events={events} user={user} onEventCreated={loadEvents} />
          <RightPanel user={user} events={events} onRefresh={loadEvents} />
        </div>
      </div>
    </Shell>
  )
}
