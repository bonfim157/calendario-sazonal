'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDesignSystem } from '@/lib/theme-provider'

interface EnhancedSidebarProps {
  user: any
}

export default function EnhancedSidebar({ user }: EnhancedSidebarProps) {
  const router = useRouter()
  const { colors, cn, getColor } = useDesignSystem()
  const [isCollapsed, setIsCollapsed] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function handleSeed() {
    const response = await fetch('/api/seed', { method: 'POST' })
    if (response.ok) {
      alert('Base de dados seedada com sucesso!')
      window.location.reload()
    }
  }

  const userInitials = user?.nome
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const getRoleColor = () => {
    switch (user?.papel) {
      case 'professor': return colors.primary[800]
      case 'aluno': return colors.semantic.success[600]
      case 'gestao': return colors.profile.gestao
      default: return colors.primary[500]
    }
  }

  const navItems = [
    { label: 'Visão Geral', path: '/dashboard', icon: '📊' },
    { label: 'Eventos', path: '/dashboard?view=events', icon: '📅' },
    { label: 'Chat', path: '/dashboard?view=chat', icon: '💬' },
    { label: 'Projetos vinculados', path: '/dashboard?view=projects', icon: '🔗' },
  ]

  return (
    <aside className={cn(
      "flex flex-col gap-4",
      "bg-card border-r border-border",
      "transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 p-4",
        "border-b border-border"
      )}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center",
            "hover:bg-muted transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? '→' : '←'}
        </button>
        
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              🏫
            </div>
            <h1 className="font-extrabold text-lg text-foreground">EduCalendário</h1>
          </div>
        )}
      </div>

      {/* Perfil do usuário */}
      <div className={cn(
        "flex items-center gap-3 p-4",
        "border-b border-border"
      )}>
        <div 
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "text-white font-bold text-lg",
            "shadow-sm transition-all hover:shadow-md"
          )}
          style={{ backgroundColor: getRoleColor() }}
        >
          {userInitials}
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground truncate">{user?.nome}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.papel}</div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-lg",
              "text-left transition-all duration-200",
              "hover:bg-muted active:scale-95",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Ações */}
      <div className={cn(
        "p-4 border-t border-border",
        "space-y-2"
      )}>
        {!isCollapsed && (
          <button
            onClick={handleSeed}
            className={cn(
              "w-full p-2 rounded-lg",
              "bg-success text-success-foreground",
              "hover:opacity-90 active:scale-95 transition-all",
              "font-medium text-sm",
              "shadow-sm"
            )}
          >
            ↻ Seed DB
          </button>
        )}
        
        <button
          onClick={handleLogout}
          className={cn(
            "w-full p-2 rounded-lg",
            "bg-destructive text-destructive-foreground",
            "hover:opacity-90 active:scale-95 transition-all",
            "font-medium text-sm",
            "shadow-sm",
            isCollapsed ? "flex items-center justify-center" : ""
          )}
        >
          {isCollapsed ? '🚪' : 'Sair'}
        </button>
      </div>

      {/* Toggle de tema */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <button
              onClick={() => {/* Será implementado quando o ThemeToggle estiver pronto */}}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg translate-x-1">
                🌙
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {/* Será implementado quando o ThemeToggle estiver pronto */}}
            className="w-full h-8 rounded-lg bg-muted flex items-center justify-center"
          >
            🌙
          </button>
        )}
      </div>
    </aside>
  )
}