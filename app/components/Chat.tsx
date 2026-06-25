'use client';

import { useEffect, useState, useRef } from 'react';

export default function Chat({ user }: { user:any }){
  const [messages,setMessages]=useState<any[]>([]);
  const [text,setText]=useState('');
  const timer = useRef<any>(null);

  async function load(){
    const r = await fetch('/api/chat');
    if(r.ok){
      const j = await r.json();
      setMessages(j.messages || []);
    }
  }

  useEffect(()=>{
    load();
    timer.current = setInterval(load,2000);
    return ()=>clearInterval(timer.current);
  },[]);

  async function send(e:any){
    e.preventDefault();
    if(!text) return;
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ text, from: user.login }) });
    setText('');
    load();
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{flex:1,overflow:'auto',padding:8}}>
        {messages.map(m=> (
          <div key={m.id} style={{marginBottom:8}}>
            <div style={{fontSize:12,color:'#374151'}}><strong>{m.from}</strong> <span style={{opacity:.6,fontSize:11}}>{new Date(m.createdAt).toLocaleString()}</span></div>
            <div style={{background:'#f3f4f6',padding:8,borderRadius:6}}>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={send} style={{display:'flex',gap:8,marginTop:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} style={{flex:1,padding:8}} placeholder="Escreva uma mensagem..." />
        <button style={{padding:'8px 12px',background:'#1e40af',color:'#fff',border:'none',borderRadius:6}}>Enviar</button>
      </form>
    </div>
  );
}
