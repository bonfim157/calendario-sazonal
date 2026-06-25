'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import EventsPanel from '../components/EventsPanel';

export default function Dashboard(){
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/auth/validate');
      if(r.ok){
        const j = await r.json();
        setUser(j.user);
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    })();
  },[]);

  if(loading) return <div style={{padding:24}}>Carregando...</div>

  return (
    <div style={{display:'flex',height:'100vh'}}>
      <Sidebar user={user} />
      <main style={{flex:1,padding:20,background:'#f8fafc'}}>
        <h2>Bem-vindo, {user?.nome}</h2>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginTop:12}}>
          <div style={{background:'#fff',padding:12,borderRadius:8,boxShadow:'0 6px 24px rgba(15,23,42,.06)'}}>
            <h3>Projetos vinculados</h3>
            <p>Área para integrar 4 projetos GitHub — cada um terá seu layout dentro do portal.</p>
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <div style={{flex:1,padding:12,background:'#eef2ff',borderRadius:8}}>Projeto A — Calendário</div>
              <div style={{flex:1,padding:12,background:'#ecfeff',borderRadius:8}}>Projeto B — Sala di Futuro</div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <div style={{flex:1,padding:12,background:'#fff7ed',borderRadius:8}}>Projeto C — Biblioteca</div>
              <div style={{flex:1,padding:12,background:'#fff1f2',borderRadius:8}}>Projeto D — Avaliações</div>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:'#fff',padding:12,borderRadius:8}}>
              <h4>Eventos recentes</h4>
              <EventsPanel />
            </div>
            <div style={{background:'#fff',padding:12,borderRadius:8,height:320,overflow:'auto'}}>
              <h4>Chat rápido</h4>
              <Chat user={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
