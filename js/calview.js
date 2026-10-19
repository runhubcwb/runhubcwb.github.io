/* Run Hub CWB · toggle Calendário/Lista: grade mensal com marcadores + lista compacta em sanfona. Preferência salva no aparelho. */
(function(){
  'use strict';
  const box=document.getElementById('rh-calview'),list=document.getElementById('rh-list'),tog=document.querySelector('.vtog');
  if(!box||!list||!tog)return;
  const KEY='rh-view-v1',MES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const WD=['D','S','T','Q','Q','S','S'],WDL=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const pad=n=>String(n).padStart(2,'0'),iso=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
  const now=new Date(),TODAY=iso(now.getFullYear(),now.getMonth(),now.getDate());
  const cards=Array.from(list.querySelectorAll('.race'));
  const dates=cards.map(c=>c.dataset.date).sort();
  let view=(()=>{try{return localStorage.getItem(KEY)==='list'?'list':'cal';}catch(e){return 'cal';}})();
  let ym=[now.getFullYear(),now.getMonth()],sel=null;
  const visible=()=>cards.filter(c=>!c.hidden);
  function byDay(){const m={};visible().forEach(c=>{(m[c.dataset.date]=m[c.dataset.date]||[]).push(c);});return m;}
  function firstDayIn(y,mo,m){const p=iso(y,mo,1).slice(0,7);return Object.keys(m).sort().find(d=>d.startsWith(p)&&d>=TODAY)||Object.keys(m).sort().find(d=>d.startsWith(p))||null;}
  const minYM=[+TODAY.slice(0,4),+TODAY.slice(5,7)-1],last=dates[dates.length-1]||TODAY,maxYM=[+last.slice(0,4),+last.slice(5,7)-1];
  const cmp=(a,b)=>a[0]*12+a[1]-(b[0]*12+b[1]);
  function render(){
    const m=byDay(),[y,mo]=ym,first=new Date(y,mo,1).getDay(),nd=new Date(y,mo+1,0).getDate();
    if(sel&&!(sel.startsWith(iso(y,mo,1).slice(0,7))&&m[sel]))sel=null;
    if(!sel)sel=firstDayIn(y,mo,m);
    let n=0;Object.keys(m).forEach(d=>{if(d.startsWith(iso(y,mo,1).slice(0,7)))n+=m[d].length;});
    let h=`<div class="cv-h"><button type="button" class="cv-nav" data-k="-1" aria-label="Mês anterior"${cmp(ym,minYM)<=0?' disabled':''}>‹</button><h3>${MES[mo]} <span>${y}</span></h3><button type="button" class="cv-nav" data-k="1" aria-label="Próximo mês"${cmp(ym,maxYM)>=0?' disabled':''}>›</button></div>`;
    h+=`<p class="cv-c"><b>${n}</b> ${n===1?'prova':'provas'} no mês</p><div class="cv-g" role="grid">`+WD.map((w,i)=>`<span class="cv-wd" title="${WDL[i]}">${w}</span>`).join('');
    for(let i=0;i<first;i++)h+='<span class="cv-e"></span>';
    for(let d=1;d<=nd;d++){
      const k=iso(y,mo,d),rs=m[k]||[],nw=rs.some(c=>c.dataset.new==='1'),past=k<TODAY;
      const cls=['cv-d',rs.length?'has':'',nw?'new':'',k===TODAY?'today':'',k===sel?'sel':'',past?'past':''].filter(Boolean).join(' ');
      const dots=rs.length?`<span class="cv-m">${rs.slice(0,3).map(c=>`<i class="${c.dataset.new==='1'?'n':''}"></i>`).join('')}${rs.length>3?`<em>+${rs.length-3}</em>`:''}</span>`:'';
      h+=rs.length?`<button type="button" class="${cls}" data-d="${k}" aria-label="${d} de ${MES[mo]}: ${rs.length} ${rs.length===1?'prova':'provas'}${nw?', com novidade':''}"${k===sel?' aria-pressed="true"':''}><b>${d}</b>${dots}</button>`:`<span class="${cls}"><b>${d}</b></span>`;
    }
    h+=`</div><div class="cv-leg"><span><i></i>prova</span><span><i class="n"></i>NEW</span><span><s></s>hoje</span></div>`;
    if(sel){const dt=new Date(+sel.slice(0,4),+sel.slice(5,7)-1,+sel.slice(8,10));h+=`<p class="cv-sel">${WDL[dt.getDay()]}, ${dt.getDate()} de ${MES[dt.getMonth()].toLowerCase()} · <b>${m[sel].length}</b> ${m[sel].length===1?'prova':'provas'}</p>`;}
    else h+=`<p class="cv-sel cv-none">Nenhuma prova neste mês${cards.some(c=>c.hidden)?' com esses filtros':''}.</p>`;
    box.innerHTML=h;
    cards.forEach(c=>c.classList.toggle('onday',c.dataset.date===sel));
    list.querySelectorAll('.month').forEach(s=>s.classList.toggle('onday',!!s.querySelector('.race.onday:not([hidden])')));
  }
  function setView(v){
    view=v;try{localStorage.setItem(KEY,v);}catch(e){}
    tog.querySelectorAll('button').forEach(b=>{const on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
    box.hidden=v!=='cal';list.classList.toggle('mode-cal',v==='cal');list.classList.toggle('mode-list',v==='list');
    if(v==='cal')render();
  }
  tog.addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(b)setView(b.dataset.v);});
  box.addEventListener('click',e=>{
    const nv=e.target.closest('.cv-nav');if(nv&&!nv.disabled){const t=new Date(ym[0],ym[1]+ +nv.dataset.k,1);ym=[t.getFullYear(),t.getMonth()];sel=null;render();return;}
    const d=e.target.closest('.cv-d[data-d]');if(d){sel=d.dataset.d;render();}
  });
  // lista: sanfona
  list.addEventListener('click',e=>{
    const s=e.target.closest('.rsum');if(!s||!list.classList.contains('mode-list'))return;
    const c=s.closest('.race'),op=!c.classList.contains('open');c.classList.toggle('open',op);s.setAttribute('aria-expanded',op);
  });
  // filtros (app.js) mudam o [hidden] dos cards: re-renderiza a grade
  new MutationObserver(()=>{if(view==='cal'){clearTimeout(render.t);render.t=setTimeout(render,0);}}).observe(list,{subtree:true,attributes:true,attributeFilter:['hidden']});
  setView(view);
})();
