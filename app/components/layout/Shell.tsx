type Role = 'professor' | 'gestao' | 'aluno' | undefined

interface Props {
  children: React.ReactNode
  role?: Role
}

export default function Shell({ children, role }: Props) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
      data-role={role}
    >
      {children}
    </div>
  )
}
