'use client'

import { useDesignSystem } from '@/lib/theme-provider'

type Role = 'professor' | 'gestao' | 'aluno' | undefined

interface ShellProps {
  children: React.ReactNode
  role?: Role
}

export default function Shell({ children, role }: ShellProps) {
  const { colors, cn } = useDesignSystem()

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden",
        "bg-background text-foreground",
        "transition-colors duration-200"
      )}
      data-role={role}
      style={{
        '--role-color': role === 'professor' ? colors.primary[800] :
                       role === 'aluno' ? colors.semantic.success[600] :
                       role === 'gestao' ? colors.profile.gestao :
                       colors.primary[800]
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
