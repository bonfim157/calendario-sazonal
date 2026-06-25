import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, senha } = body;
    const db = await getDB();
    const user = db.data?.users.find((u: any) => u.login === login);
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });

    const token = jwt.sign({ login: user.login, papel: user.papel, nome: user.nome }, SECRET, { expiresIn: '8h' });

    const res = NextResponse.json({ ok: true, user: { login: user.login, nome: user.nome, papel: user.papel } });
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}`);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}
