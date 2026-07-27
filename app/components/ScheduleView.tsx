type Schedule = { id: string; turma: string; dia: number; slot: number; disciplina: string }

const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
const HORARIOS = ['07:30','08:20','09:20','10:10','11:00','12:00','13:00']
const SUBJECT_COLORS: Record<string, string> = {
  'Matemática':       '#1a73e8', 'Português':        '#dc2626',
  'Física':           '#7c3aed', 'Química':          '#ea580c',
  'Inglês':           '#16a34a', 'Programação':      '#0891b2',
  'Programação Web':  '#0e7490', 'Banco de Dados':   '#0369a1',
  'Redes':            '#1d4ed8', 'S.O.':             '#4f46e5',
  'E. Física':        '#be185d', 'História':         '#92400e',
  'Geografia':        '#166534', 'Artes':            '#9333ea',
  'Filosofia':        '#6d28d9', 'TCC':              '#b45309',
  'Proj. Integrador': '#d97706',
}

function colorFor(d: string) { return SUBJECT_COLORS[d] ?? '#64748b' }

interface Props { schedules: Schedule[] }

export default function ScheduleView({ schedules }: Props) {
  const turmas = [...new Set(schedules.map(s => s.turma))]

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-2">
          <span>📊</span>
          <h3 className="font-bold text-sm text-slate-800">Grade Horária</h3>
        </div>
        <p className="text-xs text-slate-400">Nenhuma grade cadastrada.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-4">
        <span>📊</span>
        <h3 className="font-bold text-sm text-slate-800">Grade Horária</h3>
        {turmas.length > 0 && (
          <span className="text-xs text-slate-400">— {turmas.join(', ')}</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-semibold py-1 pr-3 w-14">Hora</th>
              {DIAS.slice(1).map(d => (
                <th key={d} className="text-center text-slate-600 font-bold py-1 px-1">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS.map((hora, slotIdx) => (
              <tr key={slotIdx} className="border-t border-slate-50">
                <td className="text-slate-400 py-1.5 pr-3 font-medium whitespace-nowrap">{hora}</td>
                {[1, 2, 3, 4, 5].map(dia => {
                  const cell = schedules.find(s => s.dia === dia && s.slot === slotIdx + 1)
                  return (
                    <td key={dia} className="py-1 px-1 text-center">
                      {cell ? (
                        <div
                          className="text-white text-[10px] font-semibold px-1 py-1 rounded-md leading-tight"
                          style={{ background: colorFor(cell.disciplina) }}
                        >
                          {cell.disciplina}
                        </div>
                      ) : (
                        <div className="h-6" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
