/* Run Hub CWB · Monte sua próxima prova: filtra o calendário só com dados que existem (distância, data, cidade, nome, largada, prazo) */
(function(){
  'use strict';
  const box=document.getElementById('wiz'),out=document.getElementById('wiz-out');if(!box||!window.RHSeason)return;
  const R=Object.values(window.RHSeason.races);
  const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const now=new Date(),T=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const dOf=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
  const ddmm=s=>s.slice(8,10)+'/'+s.slice(5,7);
  const nm=(T.getMonth()+1)%12;
  const STD=['5K','10K','21K','42K'];
  const STEPS=[
    {k:'dist',q:'Qual distância?',o:[['5K','5K'],['10K','10K'],['21K','21K · meia'],['42K','42K · maratona'],['outra','Outras distâncias']]},
    {k:'when',q:'Quando?',o:[['este',`Este mês · ${MES[T.getMonth()]}`],['prox',`Mês que vem · ${MES[nm]}`],['qq','Tanto faz']]},
    {k:'reg',q:'Onde?',o:[['curitiba','Curitiba'],['rmc','Região metropolitana'],['litoral','Litoral'],['qq','Qualquer lugar']]},
    {k:'x',q:'Algum extra? (opcional)',multi:true,o:[['noct','🌙 Noturna'],['trail','⛰️ Trail ou montanha'],['open','Prazo de inscrição em aberto']]}
  ];
  const REG={curitiba:'Curitiba',rmc:'região metropolitana',litoral:'litoral'};
  let st={dist:null,when:null,reg:null,x:[]},step=0;
  function ui(){
    const s=STEPS[step];
    box.innerHTML=`<div class="wz-top"><p class="wz-n">Passo ${step+1} de ${STEPS.length}</p><div class="wz-dots">${STEPS.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div></div>
<h3>${s.q}</h3><div class="wz-chips">${s.o.map(([v,l])=>`<button type="button" class="fchip${(s.multi?st.x.includes(v):st[s.k]===v)?' on':''}" data-v="${v}">${esc(l)}</button>`).join('')}</div>
<div class="wz-nav">${step?'<button type="button" class="btn btn-ghost btn-sm" data-a="back">← Voltar</button>':'<span></span>'}${s.multi?'<button type="button" class="btn btn-sm" data-a="go">Ver provas →</button>':''}${step===STEPS.length-1||out.innerHTML?'':''}</div>`;
  }
  box.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;const s=STEPS[step];
    if(b.dataset.a==='back'){step--;ui();return;}
    if(b.dataset.a==='go'){show();return;}
    if(b.dataset.a==='again'){st={dist:null,when:null,reg:null,x:[]};step=0;out.innerHTML='';ui();return;}
    const v=b.dataset.v;if(!v)return;
    if(s.multi){st.x=st.x.includes(v)?st.x.filter(y=>y!==v):st.x.concat(v);ui();return;}
    st[s.k]=v;step++;ui();
  });
  // cada critério devolve [ok, motivo verdadeiro, motivo do "quase"]
  function cDist(r){const ds=r.dist||[];
    if(st.dist==='outra'){const o=ds.filter(t=>!STD.includes(t));return o.length?[true,`tem ${o.join(' e ')}`]:[false,'',ds.length?`só tem ${ds.join(', ')}`:'distâncias a confirmar'];}
    return ds.includes(st.dist)?[true,`tem ${st.dist}${ds.length>1?` (de ${ds.join(' · ')})`:''}`]:[false,'',ds.length?`tem ${ds.join(', ')}, não ${st.dist}`:'distâncias a confirmar'];}
  function cWhen(r){const d=dOf(r.d),m=d.getMonth(),y=d.getFullYear();
    if(st.when==='qq')return [true,''];
    const tm=st.when==='este'?T.getMonth():nm,ty=st.when==='este'?T.getFullYear():(T.getMonth()===11?T.getFullYear()+1:T.getFullYear());
    return m===tm&&y===ty?[true,`em ${MES[m]} (${ddmm(r.d)})`]:[false,'',`é em ${MES[m]} (${ddmm(r.d)})`];}
  function cReg(r){if(st.reg==='qq')return [true,''];
    return r.reg===st.reg?[true,st.reg==='curitiba'?'em Curitiba':`${REG[st.reg]}: ${r.c}`]:[false,'',`é em ${r.c} (${r.reg==='curitiba'?'capital':REG[r.reg]})`];}
  function cX(r,x){
    if(x==='noct')return r.noct?[true,`noturna: ${r.noct}`]:[false,'','não é noturna'];
    if(x==='trail')return r.trail?[true,`trail/montanha: ${r.trail}`]:[false,'','não é trail'];
    if(x==='open'){const ok=r.prazo&&dOf(r.prazo)>=T;return ok?[true,`inscrições até ${ddmm(r.prazo)}`]:[false,'',r.enc?'inscrições encerradas':'sem prazo de inscrição publicado'];}
  }
  function evalR(r){const cs=[cDist(r),cWhen(r),cReg(r)].concat(st.x.map(x=>cX(r,x)));
    return {r,ok:cs.filter(c=>c[0]).map(c=>c[1]).filter(Boolean),miss:cs.filter(c=>!c[0]).map(c=>c[2]),distOk:cs[0][0]};}
  const fut=()=>R.filter(r=>dOf(r.d)>=T);
  function score(e){const r=e.r;let s=0;if(r.prazo&&dOf(r.prazo)>=T)s+=2;if(r.of)s+=1;if(r.novo)s+=.5;return s;}
  function item(e,near){const r=e.r,saved=window.RHSeason.has(r.id);
    return `<li class="wz-r${near?' near':''}"><div class="wz-d"><b>${r.d.slice(8,10)}</b><span>${['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][+r.d.slice(5,7)-1]}</span></div><div class="wz-b"><h4>${esc(r.n)}</h4><p class="wz-c">${esc(r.c)} · ${esc((r.dist||[]).join(' · ')||'distâncias a confirmar')}</p>
<ul class="wz-why">${e.ok.map(t=>`<li>✓ ${esc(t)}</li>`).join('')}${near?e.miss.map(t=>`<li class="no">✗ ${esc(t)}</li>`).join(''):''}</ul>
<div class="wz-acts"><a class="btn btn-sm" href="${esc(r.url)}" target="_blank" rel="noopener">${r.of?'Inscreva-se':'Ver no '+esc(r.lbl)} ↗</a><button type="button" class="star${saved?' on':''}" data-id="${r.id}" aria-pressed="${saved}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg><span>${'Vou correr'}</span></button><a class="wz-see" href="#r-${r.id}">ver no calendário</a></div></div></li>`;}
  function show(){
    const ev=fut().map(evalR);
    const hit=ev.filter(e=>!e.miss.length).sort((a,b)=>score(b)-score(a)||(a.r.d<b.r.d?-1:1));
    const sum=[st.dist==='outra'?'outras distâncias':st.dist,{este:MES[T.getMonth()],prox:MES[nm],qq:'qualquer data'}[st.when],st.reg==='qq'?'qualquer lugar':REG[st.reg]].concat(st.x.map(x=>({noct:'noturna',trail:'trail',open:'inscrições em aberto'}[x]))).join(' · ');
    let h=`<div class="wz-head"><p><b>${hit.length}</b> ${hit.length===1?'prova combina':'provas combinam'} com <b>${esc(sum)}</b></p><button type="button" class="btn btn-ghost btn-sm" id="wz-again">Refazer</button></div>`;
    if(hit.length)h+=`<ol class="wz-list">${hit.map(e=>item(e,false)).join('')}</ol><p class="wz-note">Ordem: provas com prazo de inscrição em aberto e link oficial primeiro, depois por data.</p>`;
    else{
      const mn=Math.min(...ev.filter(e=>e.miss.length).map(e=>e.miss.length)),near=(mn<=2?ev.filter(e=>e.miss.length===mn):ev.filter(e=>e.distOk)).sort((a,b)=>(a.r.d<b.r.d?-1:1)).slice(0,5),far=mn>2;
      h+=`<div class="wz-none"><p><b>Nenhuma prova bate com tudo isso.</b> ${near.length?(far?'Nada parecido no calendário. Estas têm a distância que você procura:':mn===1?'Estas chegam perto, só um detalhe é diferente:':'Estas chegam perto, com 2 detalhes diferentes:'):'Tente mudar a data ou a região.'}</p></div>`;
      if(near.length)h+=`<ol class="wz-list">${near.map(e=>item(e,true)).join('')}</ol>`;
    }
    out.innerHTML=h;
    out.querySelector('#wz-again').onclick=()=>{st={dist:null,when:null,reg:null,x:[]};step=0;out.innerHTML='';ui();box.scrollIntoView({block:'start'});};
    out.scrollIntoView({behavior:'smooth',block:'start'});
  }
  window.RHWizard={set(s){st=Object.assign({x:[]},s);step=STEPS.length-1;ui();show();},evalAll(){return fut().map(evalR);}};
  document.addEventListener('rh-season',()=>out.querySelectorAll('.star').forEach(s=>{const on=window.RHSeason.has(s.dataset.id);s.classList.toggle('on',on);s.querySelector('span').textContent='Vou correr';}));
  ui();
})();
