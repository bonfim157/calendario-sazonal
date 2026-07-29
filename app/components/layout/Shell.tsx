'use client'

import { useState, createContext, useContext } from 'react'
import { useDesignSystem } from '@/lib/theme-provider'
import { colors as dsColors } from '@/lib/design-system'

type Role = 'professor' | 'gestao' | 'aluno' | undefined

// Contexto para controlar o drawer mobile em toda a shell
interface ShellContextValue {
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

export const ShellContext = createContext<ShellContextValue>({
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
})

export function useShell() {
  return useContext(ShellContext)
}

interface ShellProps {
  children: React.ReactNode
  role?: Role
}

export default function Shell({ children, role }: ShellProps) {
  const { colors, cn } = useDesignSystem()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const ctx: ShellContextValue = {
    drawerOpen,
    openDrawer:  () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    toggleDrawer: () => setDrawerOpen(v => !v),
  }

  return (
    <ShellContext.Provider value={ctx}>
      <div
        className={cn(
          "flex h-screen overflow-hidden",
          "bg-background text-foreground",
          "transition-colors duration-200"
        )}
        data-role={role}
        style={{
          '--role-color': role === 'professor' ? dsColors.primary[800] :
                         role === 'aluno' ? dsColors.semantic.success[600] :
                         role === 'gestao' ? dsColors.profile.gestao :
                         dsColors.primary[800]
        } as React.CSSProperties}
      >
        {children}

        {/* Overlay escuro no mobile quando o drawer está aberto */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fadeIn"
            onClick={ctx.closeDrawer}
            aria-hidden="true"
          />
        )}
      </div>
    </ShellContext.Provider>
  )
}
