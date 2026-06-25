'use client';

import { useRouter } from 'next/navigation';

export default function Sidebar({ user }: { user:any }){
  const router = useRouter();

  async function logout(){
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function seed(){
    const r = await fetch('/api/seed', { method: 'POST' });
    if(r.ok) alert('Base de dados seedada');
  }

  return (
    <aside style={{width:260,background:'#0f172a',color:'#fff',padding:16,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{fontWeight:800,fontSize:18}}>EduCalendário</div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:48,height:48,borderRadius:8,background:'#1e293b',display:'flex',alignItems:'center',justifyContent:'center'}}>{user?.nome?.split(' ').map((n:any)=>n[0]).slice(0,2).join('')}</div>
        <div>
          <div style={{fontWeight:700}}>{user?.nome}</div>
          <div style={{fontSize:12,opacity:.9}}>{user?.papel}</div>
        </div>
      </div>

      <nav style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',color:'#cbd5e1',border:'none',textAlign:'left'}}>Visão Geral</button>
        <button onClick={()=>router.push('/dashboard?view=events')} style={{background:'transparent',color:'#cbd5e1',border:'none',textAlign:'left'}}>Eventos</button>
        <button onClick={()=>router.push('/dashboard?view=chat')} style={{background:'transparent',color:'#cbd5e1',border:'none',textAlign:'left'}}>Chat</button>
        <button onClick={()=>router.push('/dashboard?view=projects')} style={{background:'transparent',color:'#cbd5e1',border:'none',textAlign:'left'}}>Projetos vinculados</button>
      </nav>

      <div style={{marginTop:'auto',display:'flex',flexDirection:'column',gap:8}}>
        <button onClick={seed} style={{padding:8,borderRadius:8,border:'none',background:'#065f46',color:'#fff'}}>Seed DB</button>
        <button onClick={logout} style={{padding:8,borderRadius:8,border:'none',background:'#7f1d1d',color:'#fff'}}>Sair</button>
      </div>
    </aside>
  );
}
