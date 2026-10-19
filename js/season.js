/* Run Hub CWB · Minha temporada (localStorage, sem login) */
(function(){
  'use strict';
  const box=document.getElementById('season');if(!box||!window.RHSeason)return;
  const S=window.RHSeason,MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());};
  const dOf=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d);};
  const days=iso=>Math.round((dOf(iso)-today())/864e5);
  const ddmm=iso=>iso.slice(8,10)+'/'+iso.slice(5,7);
  function countdown(n){return n===0?'é hoje!':n===1?'é amanhã':`faltam ${n} dias`;}
  function status(r){
    if(r.prazo&&days(r.prazo)>=0){const k=days(r.prazo);const hot=k<=7;
      return `<p class="s-st${hot?' hot':''}"><span class="dot"></span>Inscrições até ${ddmm(r.prazo)}${hot?(k===0?' · último dia!':k===1?' · termina amanhã':` · faltam ${k} dias`):''}</p>`;}
    if(r.enc||(r.prazo&&days(r.prazo)<0))return '<p class="s-st off">Inscrições encerradas</p>';
    return '';
  }
  function render(){
    const saved=S.all(),ids=Object.keys(saved);
    const items=ids.map(id=>Object.assign({id},saved[id],S.races[id]||{})).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
    const fut=items.filter(r=>days(r.d)>=0),past=items.filter(r=>days(r.d)<0).reverse();
    if(!items.length){box.innerHTML=`<div class="s-empty"><div class="s-star">☆</div><h3>Sua temporada ainda está vazia</h3><p>Toque em <b>☆ Vou correr</b> nas provas do calendário ou use o <a href="#monte">Monte sua próxima prova</a>. Elas aparecem aqui em ordem de data, com contagem regressiva, prazo de inscrição e previsão do tempo.</p><a class="btn" href="#calendario">Ver calendário ↓</a></div>`;return;}
    let h='';
    if(fut.length){
      h+=`<div class="s-bar"><p class="s-sum"><b>${fut.length}</b> ${fut.length===1?'prova':'provas'} pela frente · próxima ${countdown(days(fut[0].d))}</p><div class="s-acts"><button class="btn btn-sm" id="s-ics" type="button">Adicionar todas à agenda</button><button class="btn btn-ghost btn-sm" id="s-card" type="button">Card Minha temporada ↗</button></div></div><div class="grid s-grid">`;
      fut.forEach(r=>{
        const orig=document.getElementById('r-'+r.id);
        if(!orig){h+=`<article class="race s-gone"><div class="body"><h3>${esc(r.n)}</h3><p class="via">${ddmm(r.d)} · ${esc(r.c)} · esta prova saiu do calendário. Confirme no site do organizador.</p><button class="btn btn-ghost btn-sm s-rm" data-id="${r.id}">Remover</button></div></article>`;return;}
        const c=orig.cloneNode(true);c.removeAttribute('id');c.classList.add('s-card');c.hidden=false;
        const pz=c.querySelector('.prazo');if(pz)pz.remove();
        c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
        const wx=c.querySelector('.wx');if(wx){wx.innerHTML='';wx.hidden=true;}
        const top=c.querySelector('.top');top.insertAdjacentHTML('beforebegin',`<p class="s-cd">${countdown(days(r.d))}</p>`);
        c.querySelector('.chips').insertAdjacentHTML('afterend',status(r));
        h+=c.outerHTML;
      });
      h+='</div>';
    } else h+=`<div class="s-empty s-empty-sm"><p>Nenhuma prova pela frente na sua temporada. <a href="#calendario">Escolha a próxima no calendário</a>.</p></div>`;
    if(past.length)h+=`<div class="s-past"><h3>Já corri <span>${past.length}</span></h3><ul>${past.map(r=>`<li><span class="s-pd">${ddmm(r.d)}</span><span class="s-pn">${esc(r.n)}<small>${esc(r.c)}${r.dist&&r.dist.length?' · '+esc(r.dist.join(' · ')):''}</small></span><button class="s-rm" data-id="${r.id}" aria-label="Remover ${esc(r.n)}">✕</button></li>`).join('')}</ul></div>`;
    box.innerHTML=h;
    document.dispatchEvent(new CustomEvent('rh-season-rendered'));
  }
  // .ics com todas as provas futuras, gerado no navegador
  const ie=t=>String(t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
  function fold(l){const enc=new TextEncoder();if(enc.encode(l).length<=75)return l;const out=[];let cur='',len=0,lim=75;
    for(const ch of l){const b=enc.encode(ch).length;if(len+b>lim){out.push(cur);cur=' '+ch;len=1+b;}else{cur+=ch;len+=b;}}out.push(cur);return out.join('\r\n');}
  const ymd=iso=>iso.replace(/-/g,'');
  function nextDay(iso){const d=dOf(iso);d.setDate(d.getDate()+1);return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
  function buildICS(list){
    const n=new Date(),stamp=n.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Run Hub CWB//Minha temporada//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Minha temporada · Run Hub CWB'];
    if(list.some(r=>r.st))L.push('BEGIN:VTIMEZONE','TZID:America/Sao_Paulo','BEGIN:STANDARD','DTSTART:19700101T000000','TZOFFSETFROM:-0300','TZOFFSETTO:-0300','TZNAME:-03','END:STANDARD','END:VTIMEZONE');
    list.forEach(r=>{
      L.push('BEGIN:VEVENT',`UID:${r.id}@runhubcwb.github.io`,`DTSTAMP:${stamp}`);
      if(r.st){const e=String(Math.min(+r.st.slice(0,2)+2,23)).padStart(2,'0')+r.st.slice(2);L.push(`DTSTART;TZID=America/Sao_Paulo:${ymd(r.d)}T${r.st}00`,`DTEND;TZID=America/Sao_Paulo:${ymd(r.d)}T${e}00`);}
      else L.push(`DTSTART;VALUE=DATE:${ymd(r.d)}`,`DTEND;VALUE=DATE:${nextDay(r.d)}`);
      const desc=`${r.n}\n${r.c} · ${(r.dist||[]).join(' · ')||'distâncias a confirmar'}\n${r.st?'':'Horário de largada a confirmar.\n'}${r.prazo?`Inscrições até ${ddmm(r.prazo)}\n`:''}${r.url?`\nInscrições: ${r.url}\n`:''}\nConfirme data, horário e local no site oficial do organizador.\nRun Hub CWB · runhubcwb.github.io`;
      L.push(`SUMMARY:${ie(r.n)}`,`DESCRIPTION:${ie(desc)}`);
      if(r.loc)L.push(`LOCATION:${ie(r.loc)}`);
      if(r.url)L.push(`URL:${r.url}`);
      L.push('TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${ie(r.n)}`,`TRIGGER:${r.st?'-PT2H':'-PT15H'}`,'END:VALARM','END:VEVENT');
    });
    L.push('END:VCALENDAR');return L.map(fold).join('\r\n')+'\r\n';
  }
  function futureList(){const s=S.all();return Object.keys(s).map(id=>Object.assign({id},s[id],S.races[id]||{})).filter(r=>S.races[r.id]&&days(r.d)>=0).sort((a,b)=>a.d<b.d?-1:1);}
  window.RHSeasonICS={build:buildICS,futureList};
  box.addEventListener('click',e=>{
    const rm=e.target.closest('.s-rm');if(rm){S.remove(rm.dataset.id);return;}
    if(e.target.closest('#s-ics')){const blob=new Blob([buildICS(futureList())],{type:'text/calendar;charset=utf-8'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minha-temporada-runhubcwb.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}
    if(e.target.closest('#s-card')&&window.RHCard)window.RHCard.openSeason(futureList().map(r=>Object.assign({},r,{falta:countdown(days(r.d))})));
  });
  document.addEventListener('rh-season',render);window.addEventListener('storage',render);render();
})();
