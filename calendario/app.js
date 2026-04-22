/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
const USERS = {
  professor: { login:'prof.rafael',  senha:'prof123',    nome:'Rafael F. Bonfim', papel:'professor', initials:'RF', escola:'ETEC Zona Sul' },
  aluno:     { login:'aluno.joao',   senha:'aluno123',   nome:'João P. Silva',    papel:'aluno',     initials:'JS', ra:'2024001', turma:'3º Ano TI' },
  gestao:    { login:'gestao.escola',senha:'gestao123',  nome:'Maria S. Costa',   papel:'gestao',    initials:'MC', cargo:'Coordenadora Pedagógica' }
};

const CLASSES = [
  'Programação Mobile','Versionamento','Banco de Dados','Inteligência Artificial',
  'Matemática','Português','História','Projeto de Vida','Front-End','Back-End','Educação Física'
];

const CLASS_COLORS = {
  'Programação Mobile':'#dbeafe','Versionamento':'#f0fdf4','Banco de Dados':'#fff7ed',
  'Inteligência Artificial':'#fdf4ff','Matemática':'#fef9c3','Português':'#fce7f3',
  'História':'#ffe4e6','Projeto de Vida':'#d1fae5','Front-End':'#e0f2fe',
  'Back-End':'#ede9fe','Educação Física':'#fef3c7'
};
const CLASS_TEXT = {
  'Programação Mobile':'#1e40af','Versionamento':'#15803d','Banco de Dados':'#9a3412',
  'Inteligência Artificial':'#7e22ce','Matemática':'#713f12','Português':'#9d174d',
  'História':'#881337','Projeto de Vida':'#065f46','Front-End':'#0369a1',
  'Back-End':'#5b21b6','Educação Física':'#92400e'
};
const CLASS_ABBR = {
  'Programação Mobile':'PM','Versionamento':'VER','Banco de Dados':'BD',
  'Inteligência Artificial':'IA','Matemática':'MAT','Português':'POR',
  'História':'HIS','Projeto de Vida':'PV','Front-End':'FE','Back-End':'BE','Educação Física':'EF'
};

/* Horários */
const HORARIOS = [
  {slot:1, inicio:'07:30', fim:'08:20', tipo:'aula'},
  {slot:2, inicio:'08:20', fim:'09:10', tipo:'aula'},
  {slot:3, inicio:'09:10', fim:'10:00', tipo:'aula'},
  {slot:'i1', inicio:'10:00', fim:'10:15', tipo:'intervalo'},
  {slot:4, inicio:'10:15', fim:'11:05', tipo:'aula'},
  {slot:5, inicio:'11:05', fim:'11:55', tipo:'aula'},
  {slot:'i2', inicio:'11:55', fim:'12:10', tipo:'intervalo'},
  {slot:6, inicio:'12:10', fim:'13:00', tipo:'aula'},
  {slot:7, inicio:'13:00', fim:'13:50', tipo:'aula'},
];

/* Grade semanal: índice 0=seg..4=sex, aulas por slot (7 aulas) */
const GRADE = [
  ['Programação Mobile','Versionamento','Banco de Dados','Inteligência Artificial','Matemática','Português','História'],
  ['Front-End','Back-End','Educação Física','Matemática','Português','História','Projeto de Vida'],
  ['Banco de Dados','Versionamento','Inteligência Artificial','Front-End','Projeto de Vida','Programação Mobile','Matemática'],
  ['Inteligência Artificial','Banco de Dados','Front-End','Back-End','Educação Física','Versionamento','Português'],
  ['Matemática','Educação Física','Projeto de Vida','Programação Mobile','Back-End','Front-End','Versionamento'],
];

let events = [
  {id:uid(),date:fmt(2026,3,22),title:'Reunião de Pais',cat:'red',status:'approved',nota:'Sala dos professores, 19h',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,3,25),title:'Prova de Matemática',cat:'yellow',status:'approved',nota:'3º Ano TI – Cap. 4',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,3,28),title:'Feira de Ciências',cat:'orange',status:'approved',nota:'Pátio central – todos participam',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,4,5), title:'Gincana Escolar',cat:'purple',status:'pending',nota:'Aguardando confirmação do espaço',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,4,10),title:'Prova de Front-End',cat:'yellow',status:'approved',nota:'Turma 3º Ano TI',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,4,15),title:'Conselho de Classe',cat:'red',status:'rejected',nota:'Reprovado – sala indisponível',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,4,20),title:'Semana da Tecnologia',cat:'blue',status:'approved',nota:'Palestras e workshops',autor:'prof.rafael'},
  {id:uid(),date:fmt(2026,4,30),title:'Feriado – Dia do Trabalho',cat:'green',status:'approved',nota:'Sem aulas',autor:'gestao.escola'},
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let curUser = null;
let calYear = 2026, calMonth = 3; // April
let editingId = null;
let evFilter = 'all';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
function uid(){return Math.random().toString(36).slice(2,9)}
function fmt(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function today(){const t=new Date();return fmt(t.getFullYear(),t.getMonth(),t.getDate())}
function fmtDate(s){if(!s)return '';const[y,m,d]=s.split('-');return `${d}/${m}/${y}`}
function el(id){return document.getElementById(id)}

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
function tryLogin(papel){
  const login = el(`login-${papel}`).value.trim();
  const senha = el(`senha-${papel}`).value.trim();
  const errEl = el(`err-${papel}`);
  errEl.style.display='none';

  const match = Object.values(USERS).find(u=>u.papel===papel && u.login===login && u.senha===senha);
  if(!match){
    errEl.textContent='❌ Usuário ou senha incorretos. Tente novamente.';
    errEl.style.display='block';
    return;
  }
  curUser = match;
  el('login-screen').style.display='none';
  mountApp(papel);
}

function logout(){
  curUser=null;
  ['prof-app','aluno-app','gestao-app'].forEach(id=>el(id).classList.remove('visible'));
  el('login-screen').style.display='flex';
  ['login-professor','login-aluno','login-gestao'].forEach(id=>el(id).value='');
  ['senha-professor','senha-aluno','senha-gestao'].forEach(id=>el(id).value='');
}

function mountApp(papel){
  const app = el(`${papel==='professor'?'prof':papel==='aluno'?'aluno':'gestao'}-app`);
  app.classList.add('visible');
  // Update user info blocks
  const prefix = papel==='professor'?'p':papel==='aluno'?'a':'g';
  safeSet(`uname-${prefix}`, curUser.nome);
  safeSet(`urole-${prefix}`, papel==='professor'?`Prof. · ${curUser.escola}`:papel==='aluno'?`Aluno · RA ${curUser.ra}`:curUser.cargo);
  updateTopbarDate(prefix);
  calYear=2026; calMonth=3;
  renderCal(prefix);
  if(papel==='gestao') renderGestaoStats();
  if(papel==='professor') renderProfEvents();
  if(papel==='aluno') renderAlunoEvents();
  updateNavBadge();
}

function safeSet(id,val){const e=el(id);if(e)e.textContent=val}

function updateTopbarDate(prefix){
  const d=new Date();
  safeSet(`topdate-${prefix}`, d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));
}

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function navTo(prefix, view){
  document.querySelectorAll(`#${prefix==='p'?'prof':prefix==='a'?'aluno':'gestao'}-app .view`)
    .forEach(v=>v.classList.remove('active'));
  document.querySelectorAll(`#${prefix==='p'?'prof':prefix==='a'?'aluno':'gestao'}-app .nav-item`)
    .forEach(n=>n.classList.remove('active'));
  el(`view-${prefix}-${view}`).classList.add('active');
  el(`nav-${prefix}-${view}`).classList.add('active');
  updatePageTitle(prefix, view);
}

const PAGE_TITLES = {
  'calendar':'📅 Calendário','events':'📋 Meus Eventos','new-event':'➕ Novo Evento',
  'schedule':'📚 Grade Horária','approval':'✅ Aprovação de Eventos',
  'dashboard':'📊 Painel Geral','students':'👨‍🎓 Alunos','teachers':'👨‍🏫 Professores',
};
function updatePageTitle(prefix, view){
  const app = prefix==='p'?'prof':prefix==='a'?'aluno':'gestao';
  safeSet(`title-${app}`, PAGE_TITLES[view]||view);
}

/* ══════════════════════════════════════════
   CALENDAR
══════════════════════════════════════════ */
function renderCal(prefix){
  const gridId = `cal-grid-${prefix}`;
  const lblId  = `cal-lbl-${prefix}`;
  el(lblId).textContent = `${MONTHS_PT[calMonth]} ${calYear}`;

  const grid=el(gridId);
  grid.innerHTML='';
  const todayStr=today();
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();

  for(let i=0;i<firstDay;i++){
    const c=document.createElement('div');c.className='day empty';grid.appendChild(c);
  }
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=fmt(calYear,calMonth,d);
    const isToday=(dateStr===todayStr);
    const cell=document.createElement('div');
    cell.className='day'+(isToday?' today':'');
    cell.onclick=()=>openAddModal(dateStr);

    const dn=document.createElement('div');dn.className='dn';dn.textContent=d;
    cell.appendChild(dn);

    const dayEvents = events.filter(ev=>{
      if(ev.date!==dateStr) return false;
      if(curUser.papel==='aluno') return ev.status==='approved';
      return true;
    });

    dayEvents.slice(0,3).forEach(ev=>{
      const chip=document.createElement('div');
      chip.className=`chip ${getChipClass(ev)}`;
      chip.innerHTML=`<span class="chip-dot"></span>${ev.title}`;
      chip.onclick=(e)=>{e.stopPropagation();openEditModal(ev.id)};
      cell.appendChild(chip);
    });
    if(dayEvents.length>3){
      const more=document.createElement('div');
      more.style.cssText='font-size:10px;font-weight:700;color:var(--muted);padding:1px 4px';
      more.textContent=`+${dayEvents.length-3} mais`;
      cell.appendChild(more);
    }
    grid.appendChild(cell);
  }
}

function getChipClass(ev){
  if(ev.status==='pending') return 'chip c-pending';
  if(ev.status==='rejected') return 'chip c-rejected';
  const map={blue:'c-blue',green:'c-green',yellow:'c-yellow',red:'c-red',orange:'c-orange',purple:'c-purple'};
  return 'chip '+(map[ev.cat]||'c-blue');
}

function prevMonth(prefix){
  calMonth--;if(calMonth<0){calMonth=11;calYear--;}
  renderCal(prefix);
}
function nextMonth(prefix){
  calMonth++;if(calMonth>11){calMonth=0;calYear++;}
  renderCal(prefix);
}

/* ══════════════════════════════════════════
   EVENTS LIST – PROFESSOR
══════════════════════════════════════════ */
function renderProfEvents(){
  const container=el('prof-events-list');
  if(!container) return;
  const myEvents=events.filter(ev=>ev.autor===curUser.login);
  const filtered=evFilter==='all'?myEvents:myEvents.filter(ev=>ev.status===evFilter);

  if(filtered.length===0){
    container.innerHTML=`<div class="empty-state"><div class="es-icon">📭</div><div class="es-title">Nenhum evento encontrado</div><div class="es-sub">Crie um novo evento usando o botão acima.</div></div>`;
    return;
  }
  container.innerHTML=filtered.map(ev=>evCardProf(ev)).join('');
}

function evCardProf(ev){
  const icons={blue:'📘',green:'🌿',yellow:'📝',red:'👥',orange:'🎉',purple:'⭐'};
  const iconBg={blue:'si-blue',green:'si-green',yellow:'si-yellow',red:'si-red',orange:'si-orange',purple:'si-purple'};
  const statusBadge={
    pending:`<span class="badge badge-pending">⏳ Aguardando Aprovação</span>`,
    approved:`<span class="badge badge-approved">✅ Aprovado</span>`,
    rejected:`<span class="badge badge-rejected">❌ Reprovado</span>`,
  };
  return `
  <div class="ev-card ec-${ev.status}">
    <div class="ev-icon stat-icon ${iconBg[ev.cat]||'si-blue'}">${icons[ev.cat]||'📅'}</div>
    <div class="ev-info">
      <div class="ev-title">${ev.title}</div>
      <div class="ev-meta">
        <span>📅 ${fmtDate(ev.date)}</span>
        <span>🏷️ ${catLabel(ev.cat)}</span>
        ${ev.nota?`<span>📌 ${ev.nota}</span>`:''}
      </div>
      <div style="margin-top:6px">${statusBadge[ev.status]||''}</div>
    </div>
    <div class="ev-actions">
      ${ev.status==='rejected'?`<span style="font-size:11px;color:var(--muted);font-weight:600;max-width:120px;text-align:right">Motivo: ${ev.nota||'Sem motivo'}</span>`:''}
      <button class="btn-sm btn-edit" onclick="openEditModal('${ev.id}')">✏️ Editar</button>
    </div>
  </div>`;
}

function setFilter(f,btn){
  evFilter=f;
  document.querySelectorAll('#prof-app .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProfEvents();
}

/* ══════════════════════════════════════════
   EVENTS LIST – ALUNO
══════════════════════════════════════════ */
function renderAlunoEvents(){
  const container=el('aluno-events-list');
  if(!container) return;
  const approved=events.filter(ev=>ev.status==='approved').sort((a,b)=>a.date.localeCompare(b.date));
  if(approved.length===0){
    container.innerHTML=`<div class="empty-state"><div class="es-icon">📭</div><div class="es-title">Sem eventos disponíveis</div></div>`;
    return;
  }
  container.innerHTML=approved.map(ev=>`
  <div class="ev-card ec-approved">
    <div class="ev-icon stat-icon si-${ev.cat||'blue'}">${catIcon(ev.cat)}</div>
    <div class="ev-info">
      <div class="ev-title">${ev.title}</div>
      <div class="ev-meta">
        <span>📅 ${fmtDate(ev.date)}</span>
        <span>🏷️ ${catLabel(ev.cat)}</span>
        ${ev.nota?`<span>📌 ${ev.nota}</span>`:''}
      </div>
    </div>
    <span class="badge badge-approved">✅ Confirmado</span>
  </div>`).join('');
}

/* ══════════════════════════════════════════
   GESTÃO – STATS & APPROVAL
══════════════════════════════════════════ */
function renderGestaoStats(){
  const total=events.length;
  const pending=events.filter(e=>e.status==='pending').length;
  const approved=events.filter(e=>e.status==='approved').length;
  const rejected=events.filter(e=>e.status==='rejected').length;
  safeSet('stat-total',total);
  safeSet('stat-pending',pending);
  safeSet('stat-approved',approved);
  safeSet('stat-rejected',rejected);
  updateNavBadge();
  renderApprovalList();
}

function renderApprovalList(){
  const container=el('approval-list');
  if(!container) return;
  const pending=events.filter(e=>e.status==='pending');
  if(pending.length===0){
    container.innerHTML=`<div class="empty-state"><div class="es-icon">🎉</div><div class="es-title">Nenhum evento pendente!</div><div class="es-sub">Todos os eventos foram analisados.</div></div>`;
    return;
  }
  container.innerHTML=pending.map(ev=>`
  <div class="ev-card ec-pending">
    <div class="ev-icon stat-icon si-yellow">📋</div>
    <div class="ev-info">
      <div class="ev-title">${ev.title}</div>
      <div class="ev-meta">
        <span>📅 ${fmtDate(ev.date)}</span>
        <span>👤 Prof. ${ev.autor}</span>
        <span>🏷️ ${catLabel(ev.cat)}</span>
        ${ev.nota?`<span>📌 ${ev.nota}</span>`:''}
      </div>
    </div>
    <div class="ev-actions">
      <button class="btn-sm btn-approve" onclick="approveEvent('${ev.id}')">✅ Aprovar</button>
      <button class="btn-sm btn-reject" onclick="rejectEvent('${ev.id}')">❌ Reprovar</button>
    </div>
  </div>`).join('');
}

function renderAllEventsGestao(){
  const container=el('all-events-gestao');
  if(!container) return;
  const sorted=[...events].sort((a,b)=>a.date.localeCompare(b.date));
  container.innerHTML=sorted.map(ev=>`
  <div class="ev-card ec-${ev.status}">
    <div class="ev-icon stat-icon si-${ev.cat||'blue'}">${catIcon(ev.cat)}</div>
    <div class="ev-info">
      <div class="ev-title">${ev.title}</div>
      <div class="ev-meta">
        <span>📅 ${fmtDate(ev.date)}</span>
        <span>👤 ${ev.autor}</span>
        <span>🏷️ ${catLabel(ev.cat)}</span>
      </div>
    </div>
    <span class="badge badge-${ev.status}">${statusLabel(ev.status)}</span>
  </div>`).join('');
}

function approveEvent(id){
  const ev=events.find(e=>e.id===id);
  if(ev){ev.status='approved'; renderGestaoStats(); renderCal('g'); updateNavBadge();}
}

function rejectEvent(id){
  const motivo=prompt('Motivo da reprovação (opcional):');
  const ev=events.find(e=>e.id===id);
  if(ev){ev.status='rejected'; if(motivo)ev.nota=motivo; renderGestaoStats(); renderCal('g'); updateNavBadge();}
}

function updateNavBadge(){
  const pending=events.filter(e=>e.status==='pending').length;
  const badge=el('badge-approval');
  if(badge) badge.textContent=pending>0?pending:'';
  if(badge) badge.style.display=pending>0?'':'none';
}

/* ══════════════════════════════════════════
   SCHEDULE
══════════════════════════════════════════ */
function renderSchedule(prefix){
  const container=el(`schedule-${prefix}`);
  if(!container) return;

  const dayNames=['Segunda','Terça','Quarta','Quinta','Sexta'];
  let html=`<div class="schedule-wrap"><table class="schedule-table"><thead><tr>
    <th>Horário</th>${dayNames.map(d=>`<th>${d}</th>`).join('')}
  </tr></thead><tbody>`;

  let aulaIdx=0;
  HORARIOS.forEach(h=>{
    if(h.tipo==='intervalo'){
      html+=`<tr class="sched-intervalo"><td class="time-col">${h.inicio}–${h.fim}</td>
        <td colspan="5" style="text-align:center">☕ INTERVALO (${h.fim.split(':')[1]==='15'?15:15} min)</td></tr>`;
    } else {
      html+=`<tr><td class="time-col">⏰ ${h.inicio}<br><span style="font-size:9px;color:#94a3b8">${h.fim}</span></td>`;
      for(let d=0;d<5;d++){
        const cls=GRADE[d][aulaIdx];
        const bg=CLASS_COLORS[cls]||'#f1f5f9';
        const txt=CLASS_TEXT[cls]||'#334155';
        const abbr=CLASS_ABBR[cls]||cls.slice(0,3);
        html+=`<td><div class="class-cell">
          <span style="display:inline-block;padding:3px 8px;border-radius:5px;background:${bg};color:${txt};font-size:11px;font-weight:900">${abbr}</span>
          <span class="class-full" style="color:${txt}">${cls}</span>
        </div></td>`;
      }
      html+='</tr>';
      aulaIdx++;
    }
  });

  html+='</tbody></table></div>';
  container.innerHTML=html;
}

/* ══════════════════════════════════════════
   MODAL (ADD/EDIT EVENT)
══════════════════════════════════════════ */
function openAddModal(date=''){
  editingId=null;
  el('modal-title').textContent='➕ Novo Evento';
  el('ev-title').value='';
  el('ev-date').value=date;
  el('ev-cat').value='blue';
  el('ev-nota').value='';
  el('btn-ev-delete').style.display='none';
  el('ev-submit-info').style.display=curUser?.papel==='professor'?'flex':'none';
  el('modal-bg').classList.add('open');
}

function openEditModal(id){
  const ev=events.find(e=>e.id===id);
  if(!ev) return;
  // Aluno só pode ver, não editar
  if(curUser?.papel==='aluno'){
    alert(`📅 Evento: ${ev.title}\n📌 Data: ${fmtDate(ev.date)}\n💬 ${ev.nota||'Sem observações'}`);
    return;
  }
  editingId=id;
  el('modal-title').textContent='✏️ Editar Evento';
  el('ev-title').value=ev.title;
  el('ev-date').value=ev.date;
  el('ev-cat').value=ev.cat;
  el('ev-nota').value=ev.nota||'';
  el('btn-ev-delete').style.display=curUser?.papel!=='aluno'?'inline-flex':'none';
  el('ev-submit-info').style.display=curUser?.papel==='professor'?'flex':'none';
  el('modal-bg').classList.add('open');
}

function closeModal(){el('modal-bg').classList.remove('open')}

function saveEvent(){
  const title=el('ev-title').value.trim();
  const date=el('ev-date').value;
  const cat=el('ev-cat').value;
  const nota=el('ev-nota').value.trim();
  if(!title){alert('Informe o título do evento.');return;}
  if(!date){alert('Informe a data do evento.');return;}

  if(editingId){
    const ev=events.find(e=>e.id===editingId);
    if(ev){
      ev.title=title;ev.date=date;ev.cat=cat;ev.nota=nota;
      if(curUser?.papel==='professor' && ev.status==='rejected') ev.status='pending';
    }
  } else {
    events.push({id:uid(),date,title,cat,nota,
      status:curUser?.papel==='professor'?'pending':'approved',
      autor:curUser?.login||'gestao.escola'
    });
  }
  closeModal();
  refreshAll();
}

function deleteEvent(){
  if(!editingId) return;
  if(!confirm('Excluir este evento?')) return;
  events=events.filter(e=>e.id!==editingId);
  closeModal();
  refreshAll();
}

function refreshAll(){
  if(curUser?.papel==='professor'){renderCal('p');renderProfEvents();}
  else if(curUser?.papel==='aluno'){renderCal('a');renderAlunoEvents();}
  else if(curUser?.papel==='gestao'){renderCal('g');renderGestaoStats();renderAllEventsGestao();}
  updateNavBadge();
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function catLabel(c){
  const m={blue:'Aula/Atividade',green:'Feriado/Recesso',yellow:'Prova/Avaliação',
           red:'Reunião',orange:'Evento Escolar',purple:'Outro'};
  return m[c]||c;
}
function catIcon(c){
  const m={blue:'📘',green:'🌿',yellow:'📝',red:'👥',orange:'🎉',purple:'⭐'};
  return m[c]||'📅';
}
function statusLabel(s){
  return s==='pending'?'⏳ Pendente':s==='approved'?'✅ Aprovado':'❌ Reprovado';
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  // Enter key login
  ['professor','aluno','gestao'].forEach(p=>{
    el(`senha-${p}`).addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin(p);});
  });
  // Close modal on backdrop
  el('modal-bg').addEventListener('click',e=>{if(e.target===el('modal-bg'))closeModal();});
});
