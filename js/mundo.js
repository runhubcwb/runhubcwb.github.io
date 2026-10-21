/* Run Hub CWB · Provas pelo mundo: calendário das majors/meias, índice de qualificação e caminho até a major */
(function(){
  'use strict';
  const el=document.getElementById('rh-mundo');if(!el)return;
  let D;try{D=JSON.parse(el.textContent);}catch(e){return;}
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const MES=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());};
  const dOf=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d);};
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const days=s=>Math.round((dOf(s)-today())/864e5);
  const ddmm=s=>s.slice(8,10)+'/'+s.slice(5,7),ddmmyy=s=>ddmm(s)+'/'+s.slice(0,4);
  const addD=(s,n)=>{const d=dOf(s);d.setDate(d.getDate()+n);return iso(d);};
  const cd=n=>n===0?'é hoje!':n===1?'é amanhã':n<0?'já aconteceu':`faltam ${n} dias`;
  const SH='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>';
  // próxima edição (data futura) de cada prova
  const P=D.provas.map(p=>{const ed=[p.data,p.prox].filter(x=>x&&x.v);const nx=ed.find(x=>days(x.v)>=0)||null;return Object.assign({},p,{nx:nx&&nx.v,dfonte:(nx||p.data).fonte,dver:(nx||p.data).verificado_em,after:nx&&p.prox&&p.prox.v&&nx!==p.prox?p.prox:null});})
    .sort((a,b)=>(a.nx||'9999')<(b.nx||'9999')?-1:1);
  const byId=Object.fromEntries(P.map(p=>[p.id,p]));
  function jst(j){const t=iso(today());
    if(!j.inicio&&!j.fim)return['tbc','A confirmar'];
    if(j.fim&&j.fim<t)return['off','Encerrado'];
    if(j.inicio&&j.inicio>t)return['soon',`Abre ${ddmm(j.inicio)}`];
    return['open',j.fim?`Aberto até ${ddmm(j.fim)}`:'Aberto'];}
  function dateBox(p){
    if(!p.nx)return '<div class="mu-date tbc"><b>?</b><span>data a confirmar</span></div>';
    const d=p.nx,two=p.data2&&p.nx===p.data.v;
    return `<div class="mu-date"><b>${d.slice(8,10)}${two?'–'+p.data2.v.slice(8,10):''}</b><span>${MES[+d.slice(5,7)-1]} ${d.slice(0,4)}</span></div>`;}
  function card(p){
    const js=p.janelas.map(j=>{const [k,l]=jst(j);return `<li class="mu-j ${k}"><span class="mu-pill">${l}</span><div><b>${esc(j.rotulo)}</b>${j.inicio||j.fim?` <span class="mu-dt">${j.inicio?ddmm(j.inicio)+' a ':'até '}${j.fim?ddmm(j.fim)+'/'+j.fim.slice(0,4):''}</span>`:''}${j.obs?`<p>${esc(j.obs)}</p>`:''}</div></li>`;}).join('');
    const open=p.janelas.some(j=>jst(j)[0]==='open'),n=p.nx?days(p.nx):null,hasIdx=Object.values(D.indices).some(i=>i.prova===p.id);
    return `<article class="mu-card${open?' is-open':''}" data-t="${p.tipo}" id="mu-${p.id}">
      <div class="mu-top">${dateBox(p)}<div class="mu-ttl"><p class="mu-tag ${p.tipo}">${p.tipo==='major'?'World Marathon Major · 42K':'Meia maratona · 21K'}</p><h3>${esc(p.nome)}</h3><p class="mu-loc">${esc(p.cidade)} · ${esc(p.pais)}</p></div></div>
      <p class="mu-cd">${n==null?'Edição 2027 ainda sem data oficial':cd(n)}${open?' · <b>inscrições abertas</b>':''}${p.after?` · depois: ${ddmmyy(p.after.v)}`:''}</p>
      <div class="mu-ent"><p class="mu-lbl">Como entrar</p><div class="mu-chips">${p.entrada.map(e=>`<span>${esc(e)}</span>`).join('')}</div></div>
      <ul class="mu-js">${js}</ul>
      ${p.nota?`<p class="mu-nota">${esc(p.nota)}</p>`:''}
      <div class="mu-acts"><a class="btn btn-sm" href="${esc(p.site)}" target="_blank" rel="noopener">Site oficial ↗</a>${p.nx?`<button class="btn btn-ghost btn-sm mu-go" type="button" data-id="${p.id}">Provas até lá</button>`:''}${hasIdx?'<a class="btn btn-ghost btn-sm" href="#mu-ind">Índice</a>':''}</div>
      <p class="mu-src">Fonte: <a href="${esc(p.dfonte)}" target="_blank" rel="noopener">${esc(new URL(p.dfonte).hostname.replace('www.',''))}</a> · verificado em ${ddmmyy(p.dver)}</p>
    </article>`;}
  const list=$('#mu-list');list.innerHTML=P.map(card).join('');
  $$('input[name="mu-t"]').forEach(r=>r.addEventListener('change',()=>{const v=r.value;$$('.mu-card').forEach(c=>c.hidden=v!=='all'&&c.dataset.t!==v);}));

  // ---------- índice ----------
  const tos=t=>{t=String(t||'').trim().replace(/[hm]/g,':').replace(/s/g,'');if(!/^\d{1,2}(:\d{1,2}){1,2}$/.test(t))return null;const p=t.split(':').map(Number);if(p.some(x=>x>59&&p.indexOf(x)>0))return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1];};
  const fmt=s=>{s=Math.abs(Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`;};
  const ageOn=(b,r)=>{const B=dOf(b),R=dOf(r);let a=R.getFullYear()-B.getFullYear();if(R.getMonth()<B.getMonth()||(R.getMonth()===B.getMonth()&&R.getDate()<B.getDate()))a--;return a;};
  const KEY='rh-mundo-v1';let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}};
  const f=$('#mu-form'),out=$('#mu-out'),hint=$('#mu-hint');
  if(st.nasc)$('#mu-nasc').value=st.nasc;if(st.g)($$('input[name="mu-g"]').find(r=>r.value===st.g)||{}).checked=true;if(st.dist)$('#mu-dist').value=st.dist;if(st.t)$('#mu-time').value=st.t;
  $('#mu-src').innerHTML='Fontes: '+Object.values(D.indices).map(i=>`<a href="${esc(i.fonte)}" target="_blank" rel="noopener">${esc(i.nome)} ${i.ano}</a>`).join(' · ')+` · verificado em ${ddmmyy(D.atualizado_em)}.`;
  let last=null;
  function calc(){
    const g=($$('input[name="mu-g"]').find(r=>r.checked)||{}).value||'M',nasc=$('#mu-nasc').value,dist=$('#mu-dist').value,raw=$('#mu-time').value,t=tos(raw);
    st=Object.assign(st,{g,nasc,dist,t:raw});save();
    $('#mu-time').placeholder=dist==='21K'?'ex.: 1:28:30':'ex.: 3:12:40';
    if(!raw.trim()){hint.className='hint';hint.textContent='Formato h:mm:ss · tempo líquido (chip) em prova certificada';out.innerHTML='<p class="c-empty">Digite seu tempo para ver quanto falta para cada índice.</p>';last=null;return;}
    if(!t||!nasc||t<(dist==='21K'?3000:6600)){hint.className='hint err';hint.textContent='Confira o tempo (h:mm:ss) e a data de nascimento.';out.innerHTML='';last=null;return;}
    hint.className='hint';hint.textContent='Tempo líquido (chip) em prova certificada';
    const rows=[];
    Object.entries(D.indices).filter(([,i])=>i.dist===dist).forEach(([k,i])=>{
      const p=byId[i.prova],rd=(p.prox&&p.prox.v)||p.data.v,age=ageOn(nasc,rd),by=+nasc.slice(0,4);
      const row=i.t.find(r=>i.tipo==='nascimento'?by>=r.de&&by<=r.ate:age>=r.de&&age<=r.ate);
      if(!row){rows.push({k,i,p,age,na:true});return;}
      const std=tos(row[g]),lim=i.regra==='abaixo'?std-1:std,gap=t-lim;
      rows.push({k,i,p,age,std:row[g],faixa:i.tipo==='nascimento'?`nascidos ${row.de}–${row.ate}`:`${row.de}${row.ate>=120?'+':'–'+row.ate} anos`,gap,ok:gap<=0});
    });
    rows.sort((a,b)=>(a.na?1e9:a.gap)-(b.na?1e9:b.gap));
    const nOk=rows.filter(r=>r.ok).length;
    let h=`<p class="mu-sum">${nOk?`<b>Você já tem ${nOk} ${nOk===1?'índice':'índices'}</b>`:'<b>Ainda sem índice</b>'} com ${fmt(t)} ${dist==='21K'?'na meia':'na maratona'}</p><ul class="mu-ix">`;
    rows.forEach(r=>{
      if(r.na){h+=`<li class="na"><div><b>${esc(r.i.nome)}</b><span>Idade fora das faixas publicadas</span></div></li>`;return;}
      let st2=r.ok?`<em class="ok">Você já tem o índice</em><small>sobram ${fmt(-r.gap)}</small>`:`<em>faltam ${fmt(r.gap)}</em><small>para ${r.i.regra==='abaixo'?'sub ':''}${r.std}</small>`;
      let extra='';
      if(r.i.corte_2027){const c=r.i.corte_2027;extra=r.ok&&-r.gap>=c?`<p class="mu-x ok">Dentro do corte de 2027 (${fmt(c)} abaixo do índice).</p>`:`<p class="mu-x">Com o corte de 2027 (${fmt(c)}), precisaria de ${fmt(tos(r.std)-c)}${r.ok?`: faltariam ${fmt(c+r.gap)}`:''}.</p>`;}
      if(r.i.so_uk)extra+='<p class="mu-x">Good For Age vale só para residentes no Reino Unido.</p>';
      const pct=Math.max(4,Math.min(100,100*tos(r.std)/(t||1)));
      h+=`<li class="${r.ok?'ok':''}"><div><b>${esc(r.i.nome)} ${r.i.ano}</b><span>${r.faixa} · índice ${r.i.regra==='abaixo'?'sub ':''}${r.std}</span><i class="mu-bar"><i style="width:${pct.toFixed(1)}%"></i></i>${extra}</div><div class="mu-res">${st2}</div></li>`;
    });
    h+='</ul>';
    h+=dist==='21K'?'<p class="mu-x">Tempo de meia só vale para a Meia de Nova York. Para as maratonas (Boston, Chicago, Nova York, Berlim, Londres) é preciso uma maratona completa certificada.</p>':`<p class="mu-x">${esc(D.sem_indice.toquio)} ${esc(D.sem_indice.sydney)}</p>`;
    h+='<div class="mu-acts"><button class="btn mu-card-ix" type="button">Gerar card pros stories '+SH+'</button></div>';
    out.innerHTML=h;
    last={mode:'indice',t:fmt(t),dist,g,age:rows.length?rows[0].age:null,rows:rows.filter(r=>!r.na).map(r=>({nome:r.i.nome,ok:r.ok,gap:fmt(r.gap),std:r.std}))};
  }
  f.addEventListener('input',calc);f.addEventListener('change',calc);calc();
  out.addEventListener('click',e=>{if(e.target.closest('.mu-card-ix')&&last&&window.RHCard)window.RHCard.openMundo(last);});

  // ---------- caminho ----------
  let R=[];const re=document.getElementById('rh-races');if(re)try{R=JSON.parse(re.textContent);}catch(e){}
  R=R.filter(r=>days(r.d)>=0&&!/rio negro/i.test(r.c));
  const cover=R.reduce((m,r)=>r.d>m?r.d:m,iso(today()));
  const sel=$('#mu-alvo'),plan=$('#mu-plan');
  const alvos=P.filter(p=>p.nx);
  sel.innerHTML=['major','meia'].map(t=>`<optgroup label="${t==='major'?'World Marathon Majors':'Meias maratonas'}">${alvos.filter(p=>p.tipo===t).map(p=>`<option value="${p.id}">${esc(p.curto)} · ${ddmmyy(p.nx)}</option>`).join('')}</optgroup>`).join('');
  sel.value=byId[st.alvo]&&byId[st.alvo].nx?st.alvo:'toquio';
  let lastPlan=null,cur=[];
  const MESX=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const starBtn=id=>{const on=window.RHSeason&&window.RHSeason.has(id);return `<button class="star${on?' on':''}" type="button" data-id="${id}" aria-pressed="${on}" aria-label="Vou correr: salvar em Minha temporada">${STAR}<span>Vou correr</span></button>`;};
  const picked=()=>cur.filter(r=>window.RHSeason&&window.RHSeason.has(r.id));
  function build(){
    const p=byId[sel.value];if(!p)return;st.alvo=p.id;save();
    const T=p.nx;cur=R.filter(r=>r.d<T).sort((x,y)=>x.d<y.d?-1:1);
    let h=`<div class="mu-hero"><div><p class="eyebrow">Provas do nosso calendário antes de</p><h3>${esc(p.curto)}</h3><p class="mu-loc">${esc(p.nome)} · ${ddmmyy(T)}${p.data2&&T===p.data.v?' e '+ddmm(p.data2.v):''}</p></div><div class="mu-big"><b>${Math.max(0,days(T))}</b><span>dias para a prova</span></div></div>`;
    if(!cur.length)h+=`<p class="mu-none">Nosso calendário vai, por enquanto, até ${ddmmyy(cover)}. Novas provas aparecem aqui conforme forem anunciadas.</p>`;
    else{
      h+=`<p class="mu-sum"><b>${cur.length} ${cur.length===1?'prova':'provas'}</b> de Curitiba, RMC e litoral até ${ddmmyy(T)}${cover<T?` · nosso calendário vai, por enquanto, até ${ddmmyy(cover)}`:''}</p><div class="mu-steps">`;
      const g={};cur.forEach(r=>{const k=r.d.slice(0,7);(g[k]=g[k]||[]).push(r);});
      Object.keys(g).forEach(k=>{h+=`<div class="mu-step"><h4>${MESX[+k.slice(5)-1]} ${k.slice(0,4)}</h4><p class="mu-lbl">${g[k].length} ${g[k].length===1?'prova':'provas'}</p><ul class="mu-opts">`+g[k].map(r=>`<li><div class="mu-od"><b>${r.d.slice(8,10)}</b><span>${MES[+r.d.slice(5,7)-1]}</span></div><div class="mu-on"><b>${esc(r.n)}</b><span>${esc(r.c)}${(r.dist||[]).length?' · '+r.dist.join(' · '):''}</span>${r.url?`<a class="mu-reg" href="${esc(r.url)}" target="_blank" rel="noopener">Inscrições: ${esc(r.lbl||'site oficial')} ↗</a>`:''}</div>${starBtn(r.id)}</li>`).join('')+'</ul></div>';});
      h+='</div>';}
    h+=`<div class="mu-acts"><button class="btn" type="button" id="mu-ics">Adicionar à agenda</button><button class="btn btn-ghost" type="button" id="mu-share">Card Minhas provas ${SH}</button><a class="btn btn-ghost" href="index.html#temporada">★ Minha temporada</a></div><p class="mu-x">Sugestões de provas do calendário. Para planejar seus treinos, fale com seu treinador.</p><p class="mu-x">A agenda e o card levam ${esc(p.curto)} e as provas que você marcar com ☆ Vou correr.</p>`;
    plan.innerHTML=h;mk();
  }
  function mk(){const p=byId[sel.value];const pk=picked();lastPlan={mode:'caminho',alvo:p.curto,nome:p.nome,d:p.nx,falta:days(p.nx),sel:pk.length>0,races:(pk.length?pk:cur).slice(0,5).map(r=>({n:r.n,d:r.d,c:r.c,dist:r.dist||[]})),total:(pk.length?pk:cur).length};}
  sel.addEventListener('change',build);build();
  document.addEventListener('rh-season',()=>{plan.querySelectorAll('.star').forEach(s=>{const on=window.RHSeason.has(s.dataset.id);s.classList.toggle('on',on);s.setAttribute('aria-pressed',on);});mk();});
  list.addEventListener('click',e=>{const b=e.target.closest('.mu-go');if(!b)return;sel.value=b.dataset.id;build();document.getElementById('mu-path').scrollIntoView({behavior:'smooth'});});
  // .ics: prova alvo + provas sugeridas (dia inteiro)
  const ie=t=>String(t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  function ics(){const p=byId[sel.value],ev=[{u:'mundo-'+p.id,s:p.nome,d:p.nx,l:p.cidade+', '+p.pais,x:'Confirme no site oficial: '+p.site+' · runhubcwb.github.io/mundo.html'}];
    picked().forEach(r=>ev.push({u:'rh-'+r.id,s:r.n,d:r.d,l:r.c+', PR',x:(r.url?'Inscrições: '+r.url+' · ':'')+'runhubcwb.github.io'}));
    const st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
    const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Run Hub CWB//Provas pelo mundo//PT-BR','CALSCALE:GREGORIAN'];
    ev.forEach(e=>L.push('BEGIN:VEVENT','UID:'+e.u+'@runhubcwb.github.io','DTSTAMP:'+st,'DTSTART;VALUE=DATE:'+e.d.replace(/-/g,''),'DTEND;VALUE=DATE:'+addD(e.d,1).replace(/-/g,''),'SUMMARY:'+ie(e.s),'LOCATION:'+ie(e.l),'DESCRIPTION:'+ie(e.x),'END:VEVENT'));
    L.push('END:VCALENDAR');return L.join('\r\n');}
  plan.addEventListener('click',e=>{
    if(e.target.closest('#mu-ics')){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics()],{type:'text/calendar;charset=utf-8'}));a.download='provas-ate-'+sel.value+'-runhubcwb.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}
    if(e.target.closest('#mu-share')&&lastPlan&&window.RHCard)window.RHCard.openMundo(lastPlan);});
  window.RHMundo={plan:()=>lastPlan,indice:()=>last,build,calc};
})();
