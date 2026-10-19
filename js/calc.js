/* Run Hub CWB · calculadora "Seu tempo dava pódio?" e conversor de pace (100% no navegador) */
(function(root){
  'use strict';
  function parseTime(s){
    s=String(s==null?'':s).trim().replace(/\s+/g,'');
    let m=s.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);
    if(m)return (+m[1])*3600+(+m[2])*60+(+m[3])||null;
    m=s.match(/^(\d{1,3}):([0-5]\d)$/);
    if(m)return (+m[1])*60+(+m[2])||null;
    return null;
  }
  function fmt(sec){
    sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60,p=n=>String(n).padStart(2,'0');
    return h?`${h}:${p(m)}:${p(s)}`:`${m}:${p(s)}`;
  }
  function distKm(label){
    const map={'21K':21.0975,'42K':42.195};
    if(map[label])return map[label];
    const n=parseFloat(String(label).replace(',','.'));return isNaN(n)?null:n;
  }
  function pace(sec,km){return km>0?fmt(sec/km):null;}
  const asc=(a,b)=>a-b;
  function lists(race,g){
    if(g==='G'){
      const top=race.top5.M.concat(race.top5.F).sort(asc).slice(0,5); // os 5 mais rápidos do geral estão entre os top 5 de cada sexo
      const full=race.full?race.full.M.concat(race.full.F).sort(asc):null;
      return {top,full};
    }
    return {top:race.top5[g].slice().sort(asc),full:race.full?race.full[g].slice().sort(asc):null};
  }
  // Avalia um tempo (s) contra uma prova. kind: 'exact' (lista completa) | 'top5' (entra no top 5) | 'out' (fora do top 5, só top 5 conhecido)
  function evaluate(race,t,g){
    const {top,full}=lists(race,g),fifth=top.length>=5?top[4]:null;
    if(full){
      const pos=1+full.filter(x=>x<t).length;
      return {kind:'exact',pos,n:full.length,fifth,diff:fifth==null?null:t-fifth,inTop5:pos<=5};
    }
    if(fifth!=null&&t<=fifth) return {kind:'top5',pos:1+top.filter(x=>x<t).length,fifth,diff:t-fifth,inTop5:true};
    if(fifth==null) return {kind:'top5',pos:1+top.filter(x=>x<t).length,fifth:null,diff:null,inTop5:true,short:top.length};
    return {kind:'out',pos:null,fifth,diff:t-fifth,inTop5:false};
  }
  const GL={M:'no geral masculino',F:'no geral feminino',G:'no geral'};
  function describe(race,r,g){
    const label=`${race.curto} ${race.dist} (${race.data})`;
    let pos,diff;
    if(r.kind==='out'){
      pos=`você ficaria <b>fora do top 5</b> ${GL[g]}`;
      diff=`Faltaram ${fmt(r.diff)} pro 5º (corte: ${fmt(r.fifth)})`;
    }else{
      pos=`você seria o <b>${r.pos}º</b> ${GL[g]}`;
      if(r.fifth==null)diff='Top 5 incompleto nesta prova';
      else if(r.inTop5)diff=r.diff<0?`Dentro do top 5 · ${fmt(-r.diff)} abaixo do tempo do 5º (${fmt(r.fifth)})`:`Dentro do top 5 · empatado com o tempo do 5º (${fmt(r.fifth)})`;
      else diff=`Faltaram ${fmt(r.diff)} pro 5º (corte: ${fmt(r.fifth)})`;
    }
    const src=`Fonte: ${race.plat} · tempo ${race.tempo} · `+(r.kind==='exact'?`posição exata pela lista completa (${r.n} concluintes)`:'comparação com o top 5 oficial')+(race.parcial?' · resultado parcial (tempo real)':'');
    return {label,pos,diff,src,text:`${label}: ${pos.replace(/<[^>]+>/g,'')}. ${diff}.`};
  }
  const API={parseTime,fmt,distKm,pace,evaluate,describe};
  if(typeof module!=='undefined'&&module.exports){module.exports=API;return;}
  root.RHCalc=API;

  // ---------- UI ----------
  const $=s=>document.querySelector(s);
  const dataEl=$('#rh-results');if(!dataEl)return;
  const DATA=JSON.parse(dataEl.textContent);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dsel=$('#c-dist'),tin=$('#c-time'),out=$('#c-out'),hint=$('#c-hint');
  const labels=Array.from(new Set(['5K','10K','21K','42K'].concat(DATA.map(r=>r.dist)))).sort((a,b)=>distKm(a)-distKm(b));
  dsel.innerHTML=labels.map(l=>{const n=DATA.filter(r=>r.dist===l).length;return `<option value="${esc(l)}">${esc(l)}${n?` · ${n} ${n===1?'prova':'provas'}`:''}</option>`;}).join('');
  dsel.value=labels.includes('10K')?'10K':labels[0];
  function run(){
    const d=dsel.value,g=(document.querySelector('input[name="c-g"]:checked')||{}).value||'M',raw=tin.value.trim(),t=parseTime(raw);
    hint.classList.toggle('err',!!raw&&!t);hint.textContent=raw&&!t?'Formato inválido: use mm:ss (ex.: 36:00) ou h:mm:ss (ex.: 1:45:30)':'Formato mm:ss ou h:mm:ss';
    if(!t){out.innerHTML='<p class="c-empty">Digite seu tempo para comparar com o top 5 de cada prova.</p>';if(root.RHCard)root.RHCard.calcReady(null);return;}
    const races=DATA.filter(r=>r.dist===d);
    const km=races.length?races[0].km:distKm(d);
    let h=`<div class="c-pace"><b>${pace(t,km)}</b><span>min/km · seu pace nos ${esc(d)}</span></div>`;
    if(!races.length){h+=`<p class="c-none">Ainda não temos resultados de ${esc(d)} no histórico. Novos resultados entram toda semana.</p>`;}
    else h+='<ul class="c-list">'+races.map(r=>{const e=evaluate(r,t,g),x=describe(r,e,g);
      return `<li class="c-res${e.inTop5?' in':''}"><h4>${esc(r.curto)} ${esc(r.dist)} <small>· ${esc(r.data)} · ${esc(r.cidade)}${r.mod?' · '+esc(r.mod):''}</small></h4><p class="c-pos">${x.pos}</p><p class="c-diff">${x.diff}</p><p class="c-src">${esc(x.src)}</p></li>`;}).join('')+'</ul>';
    out.innerHTML=h;
    // melhor comparação para o card dos stories
    let best=null;
    races.forEach(r=>{const e=evaluate(r,t,g);const k=e.inTop5?[0,e.pos]:[1,e.diff];if(!best||k[0]<best.k[0]||(k[0]===best.k[0]&&k[1]<best.k[1]))best={k,r,e};});
    let line='',src='';
    if(best){const r=best.r,e=best.e,nm=`${r.curto} ${r.dist}`;
      line=e.inTop5?`Eu seria o ${e.pos}º ${GL[g]} da ${nm}`:`Faltaram ${fmt(e.diff)} pro top 5 ${GL[g]} da ${nm}`;
      src=`Comparação com ${e.kind==='exact'?'a lista completa':'o top 5 oficial'} · ${r.plat} · ${r.data}${r.parcial?' · resultado parcial':''}`;}
    const info={dist:d,time:fmt(t),pace:pace(t,km),line,src};
    root.RHLastCalc=info;
    if(root.RHCard)root.RHCard.calcReady(info);
  }
  [dsel,tin].forEach(el=>el.addEventListener('input',run));dsel.addEventListener('change',run);
  document.querySelectorAll('input[name="c-g"]').forEach(r=>r.addEventListener('change',run));
  run();
  // conversor
  const vd=$('#v-dist'),vkw=$('#v-kmw'),vkm=$('#v-km'),vt=$('#v-time'),vp=$('#v-pace'),vo=$('#v-out');let last='t';
  const km=()=>vd.value==='x'?parseFloat(String(vkm.value).replace(',','.')):parseFloat(vd.value);
  function conv(){
    vkw.hidden=vd.value!=='x';const k=km();
    if(!(k>0)){vo.innerHTML='Informe a distância em km.';return;}
    if(last==='t'){const t=parseTime(vt.value);if(!t){vp.value='';vo.innerHTML=vt.value.trim()?'Tempo inválido: use mm:ss ou h:mm:ss.':'Preencha o tempo <b>ou</b> o pace: o outro campo é calculado.';return;}
      vp.value=pace(t,k);vo.innerHTML=`Pace médio<span class="big">${pace(t,k)} /km</span>${(k/(t/3600)).toFixed(1).replace('.',',')} km/h`;}
    else{const p=parseTime(vp.value);if(!p){vt.value='';vo.innerHTML=vp.value.trim()?'Pace inválido: use m:ss (ex.: 4:30).':'Preencha o tempo <b>ou</b> o pace: o outro campo é calculado.';return;}
      const t=p*k;vt.value=fmt(t);vo.innerHTML=`Tempo previsto<span class="big">${fmt(t)}</span>${(3600/p).toFixed(1).replace('.',',')} km/h`;}
  }
  vt.addEventListener('input',()=>{last='t';conv();});vp.addEventListener('input',()=>{last='p';conv();});
  [vd,vkm].forEach(el=>{el.addEventListener('input',conv);el.addEventListener('change',conv);});
})(typeof window!=='undefined'?window:this);
