'use client';

import React, { useEffect, useState } from 'react';
import Chat from './Chat';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

function uid(){return Math.random().toString(36).slice(2,9)}
function fmt(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function today(){const t=new Date();return fmt(t.getFullYear(),t.getMonth(),t.getDate())}

export default function LegacyApp(){
  const [user,setUser]=useState<any>(null);
  const [events,setEvents]=useState<any[]>([]);
  const [messages,setMessages]=useState<any[]>([]);
  const [calYear,setCalYear]=useState<number>(new Date().getFullYear());
  const [calMonth,setCalMonth]=useState<number>(new Date().getMonth());

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/auth/validate');
      if(r.ok){ const j = await r.json(); setUser(j.user); }
    })();
    loadEvents(); loadMessages();
  },[]);

  async function loadEvents(){
    const r = await fetch('/api/events'); if(r.ok){ const j = await r.json(); setEvents(j.events||[]); }
  }
  async function loadMessages(){
    const r = await fetch('/api/chat'); if(r.ok){ const j = await r.json(); setMessages(j.messages||[]); }
  }

  function getDaysArray(year:number,month:number){
    const firstDay = new Date(year,month,1).getDay();
    const daysInMonth = new Date(year,month+1,0).getDate();
    const arr:any[] = [];
    for(let i=0;i<firstDay;i++) arr.push(null);
    for(let d=1;d<=daysInMonth;d++) arr.push({ day:d, date:fmt(year,month,d)});
    return arr;
  }

  function prevMonth(){ if(calMonth===0){ setCalMonth(11); setCalYear(calYear-1);} else setCalMonth(calMonth-1)}
  function nextMonth(){ if(calMonth===11){ setCalMonth(0); setCalYear(calYear+1);} else setCalMonth(calMonth+1)}

  const days = getDaysArray(calYear,calMonth);

  return (
    <div className="app visible" style={{height:'100vh'}}>
      <aside className="sidebar sb-prof">
        <div className="sb-head">
          <div className="sb-brand"><span className="bi">📚</span><div><span className="bn">EduCalendário</span><span className="bs">Portal</span></div></div>
          <div className="user-pill">
            <div className={"av av-p"} style={{width:48,height:48}}>{user?user.nome.split(' ').map((n:any)=>n[0]).slice(0,2).join(''):'—'}</div>
            <div><div className="u-name">{user?.nome||'—'}</div><div className="u-role">{user?.papel||'—'}</div></div>
            <div className="online"/>
          </div>
        </div>
        <nav style={{padding:14}}>
          <div className="nav-item active">Visão Geral</div>
          <div className="nav-item">Eventos</div>
          <div className="nav-item">Chat</div>
          <div className="nav-item">Projetos vinculados</div>
        </nav>
        <div className="sb-foot" style={{padding:18}}>
          <button className="btn-out" onClick={async ()=>{await fetch('/api/seed',{method:'POST'}); loadEvents(); loadMessages();}}>Seed DB</button>
          <button className="btn-out" onClick={async ()=>{await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login';}}>Sair</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="page-title">Bem-vindo, {user?.nome||'—'}</div>
            <div className="page-sub">Portal escolar</div>
          </div>
          <div className="topbar-date">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>

        <div className="content">
          <div className="cal-bar">
            <button className="nav-btn" onClick={prevMonth}>◀</button>
            <div className="month-lbl">{MONTHS_PT[calMonth]} {calYear}</div>
            <button className="nav-btn" onClick={nextMonth}>▶</button>
            <div style={{marginLeft:'auto'}}>
              <button className="btn-new" onClick={()=>alert('Use o botão Novo Evento na barra lateral')}>Novo Evento</button>
            </div>
          </div>

          <div className="weekdays">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=> <div key={d}>{d}</div>)}
          </div>

          <div className="cal-grid" id="cal-grid-p" style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
            {days.map((item:any,idx:number)=>{
              if(!item) return <div key={idx} className="day empty" />;
              const dateStr = item.date;
              const dayEvents = events.filter(ev=>ev.date===dateStr && (user?.papel!=='aluno' || ev.status==='approved'));
              return (
                <div key={idx} className={"day" + (dateStr===today()?' today':'')} onClick={()=>alert('Adicionar evento em '+dateStr)}>
                  <div className="dn">{item.day}</div>
                  {dayEvents.slice(0,3).map(ev=> (
                    <div key={ev.id} className={`chip ${ev.status==='pending'?'c-pending':ev.status==='rejected'?'c-rejected':'c-green'}`} style={{marginTop:6}} onClick={(e)=>{e.stopPropagation(); alert(ev.title+' \n'+(ev.nota||''))}}>
                      <span className="chip-dot"/> {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <aside style={{width:320,padding:18}}>
        <div className="card" style={{marginBottom:12}}>
          <div className="section-title">Projetos vinculados</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div className="card" style={{background:'#eef2ff'}}>Projeto A — Calendário</div>
            <div className="card" style={{background:'#ecfeff'}}>Projeto B — Sala di Futuro</div>
            <div className="card" style={{background:'#fff7ed'}}>Projeto C — Biblioteca</div>
            <div className="card" style={{background:'#fff1f2'}}>Projeto D — Avaliações</div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Eventos recentes</div>
          {events.slice(0,5).map(ev=> (
            <div key={ev.id} className="ev-card">
              <div className="ev-info">
                <div className="ev-title">{ev.title}</div>
                <div className="ev-meta">{ev.date} · {ev.status}</div>
                <div style={{marginTop:6}}>{ev.nota}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{marginTop:12}}>
          <div className="section-title">Chat rápido</div>
          <div style={{height:220,overflow:'auto',padding:6}}>
            {messages.map(m=> (
              <div key={m.id} style={{marginBottom:10}}>
                <div style={{fontSize:12,color:'#374151'}}><strong>{m.from}</strong> <span style={{opacity:.6,fontSize:11}}>{new Date(m.createdAt).toLocaleString()}</span></div>
                <div style={{background:'#f3f4f6',padding:8,borderRadius:8}}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:8}}>
            <Chat user={user} />
          </div>
        </div>
      </aside>
    </div>
  );
}
