'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Shell from '@/app/components/layout/Shell'
import Sidebar from '@/app/components/layout/Sidebar'
import Topbar from '@/app/components/layout/Topbar'
import EnhancedCalendar from '@/app/components/EnhancedCalendar'
import RightPanel from '@/app/components/RightPanel'

type User  = { login: string; nome: string; papel: 'professor' | 'aluno' | 'gestao' }
type Event = {
  id: string; date: string; title: string; category: string;
  status: 'pending' | 'approved' | 'rejected'; nota?: string; autor_login?: string
}

// Skeleton screen profissional enquanto carrega
function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 animate-fadeIn">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 shrink-0 h-full flex-col gap-4 p-4 bg-slate-200 animate-shimmer">
        <div className="h-10 rounded-xl bg-slate-300/60" />
        <div className="h-12 rounded-xl bg-slate-300/60" />
        <div className="flex-1 space-y-2 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-300/60" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Topbar skeleton */}
        <div className="h-16 shrink-0 bg-white border-b border-slate-100 animate-shimmer" />
        {/* Calendar skeleton */}
        <div className="flex-1 p-6 grid grid-cols-7 gap-2 content-start">
          {[...Array(35)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-slate-200 animate-shimmer"
              style={{ animationDelay: `${(i % 7) * 30}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DashboardInner() {
  const [user, setUser]       = useState<User | null>(null)
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeView = searchParams.get('view') ?? undefined

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

  if (loading) return <DashboardSkeleton />

  return (
    <Shell role={user?.papel}>
      <Sidebar user={user} activeView={activeView} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={user} />
        <div className="flex flex-1 min-h-0 overflow-hidden animate-fadeSlideUp">
          <EnhancedCalendar events={events} user={user} onEventCreated={loadEvents} />
          <RightPanel user={user} events={events} onRefresh={loadEvents} />
        </div>
      </div>
    </Shell>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  )
}
