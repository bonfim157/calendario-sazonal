'use client';

import { useEffect, useState } from 'react';

export default function EventsPanel(){
  const [events,setEvents]=useState<any[]>([]);

  async function load(){
    const r = await fetch('/api/events');
    if(r.ok){
      const j = await r.json();
      setEvents(j.events || []);
    }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div>
      {events.length===0 && <div style={{color:'#6b7280'}}>Nenhum evento</div>}
      {events.map(ev=> (
        <div key={ev.id} style={{padding:8,borderBottom:'1px solid #eef2ff'}}>
          <div style={{fontWeight:700}}>{ev.title}</div>
          <div style={{fontSize:12,color:'#6b7280'}}>{ev.date} · {ev.status}</div>
          <div style={{marginTop:6}}>{ev.nota}</div>
        </div>
      ))}
    </div>
  );
}
