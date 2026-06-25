import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const token = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('token='))?.split('=')[1];
    if(!token) return NextResponse.json({ ok: false }, { status: 401 });
    const payload = jwt.verify(token, SECRET) as any;
    return NextResponse.json({ ok: true, user: payload });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
