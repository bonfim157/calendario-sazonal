import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = await getDB();
  return NextResponse.json({ events: db.data?.events || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDB();
    const ev = { id: uuidv4(), ...body, status: body.status || 'pending' };
    db.data!.events.push(ev);
    await db.write();
    return NextResponse.json({ ok: true, event: ev });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 });
  }
}
