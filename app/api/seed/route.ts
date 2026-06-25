import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db';

export async function POST() {
  const db = await getDB();
  // seed users
  const users = [
    { login: 'prof.rafael', senha: await bcrypt.hash('prof123', 10), nome: 'Rafael F. Bonfim', papel: 'professor', initials: 'RF', escola: 'ETEC Zona Sul' },
    { login: 'aluno.joao', senha: await bcrypt.hash('aluno123', 10), nome: 'João P. Silva', papel: 'aluno', initials: 'JS', ra: '2024001', turma: '3º Ano TI' },
    { login: 'gestao.escola', senha: await bcrypt.hash('gestao123', 10), nome: 'Maria S. Costa', papel: 'gestao', initials: 'MC', cargo: 'Coordenadora Pedagógica' }
  ];

  db.data!.users = users.map(u => ({ id: uuidv4(), ...u, criadoEm: new Date().toISOString() }));

  // seed events
  const events = [
    { id: uuidv4(), date: '2026-03-22', title: 'Reunião de Pais', cat: 'red', status: 'approved', nota: 'Sala dos professores, 19h', autor: 'prof.rafael' },
    { id: uuidv4(), date: '2026-03-25', title: 'Prova de Matemática', cat: 'yellow', status: 'approved', nota: '3º Ano TI – Cap. 4', autor: 'prof.rafael' },
    { id: uuidv4(), date: '2026-04-05', title: 'Gincana Escolar', cat: 'purple', status: 'pending', nota: 'Aguardando confirmação do espaço', autor: 'prof.rafael' },
  ];
  db.data!.events = events;

  // seed simple schedule entries
  db.data!.schedules = [
    { id: uuidv4(), turma: '3º Ano TI', dia: 1, slot: 1, disciplina: 'Programação Mobile', professor: 'prof.rafael' }
  ];

  // seed messages
  db.data!.messages = [
    { id: uuidv4(), from: 'gestao.escola', to: 'prof.rafael', text: 'Precisamos alinhar a gincana', createdAt: new Date().toISOString() }
  ];

  await db.write();
  return NextResponse.json({ ok: true, seeded: { users: db.data!.users.length, events: db.data!.events.length } });
}
