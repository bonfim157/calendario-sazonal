import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.error('❌ JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Usando fallback para desenvolvimento APENAS. NUNCA use em produção.')
  } else {
    throw new Error('JWT_SECRET não configurado para produção')
  }
}

const SECRET_TO_USE = SECRET || (process.env.NODE_ENV === 'development' ? 'dev_secret_change_me_temp_only' : '')

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const token = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('token='))?.split('=')[1];
    if(!token) return NextResponse.json({ ok: false }, { status: 401 });
    const payload = jwt.verify(token, SECRET_TO_USE) as any;
    return NextResponse.json({ ok: true, user: payload });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
