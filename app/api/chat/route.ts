import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = await getDB();
  return NextResponse.json({ messages: db.data?.messages || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDB();
    const m = { id: uuidv4(), text: body.text, from: body.from, to: body.to || null, createdAt: new Date().toISOString() };
    db.data!.messages.push(m);
    await db.write();
    return NextResponse.json({ ok: true, message: m });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar mensagem' }, { status: 500 });
  }
}
