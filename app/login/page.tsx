'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(){
  const [login,setLogin]=useState('');
  const [senha,setSenha]=useState('');
  const [err,setErr]=useState('');
  const router = useRouter();

  async function submit(e: any){
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ login, senha }) });
    if(res.ok){
      router.push('/dashboard');
    } else {
      const j = await res.json();
      setErr(j.error || 'Erro no login');
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#f3f4f6'}}>
      <form onSubmit={submit} style={{background:'#fff',padding:24,borderRadius:12,boxShadow:'0 6px 20px rgba(0,0,0,.08)',width:380}}>
        <h2 style={{marginBottom:12}}>Entrar — EduCalendário</h2>
        <div style={{marginBottom:8}}>
          <label style={{fontSize:12}}>Login</label>
          <input value={login} onChange={e=>setLogin(e.target.value)} style={{width:'100%',padding:8,marginTop:6}} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12}}>Senha</label>
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} style={{width:'100%',padding:8,marginTop:6}} />
        </div>
        <button style={{width:'100%',padding:10,background:'#1e40af',color:'#fff',border:'none',borderRadius:6}}>Entrar</button>
        {err && <div style={{color:'red',marginTop:12}}>{err}</div>}
        <div style={{marginTop:12,fontSize:12,color:'#6b7280'}}>Use as contas demo: prof.rafael / prof123, aluno.joao / aluno123, gestao.escola / gestao123</div>
      </form>
    </div>
  );
}
