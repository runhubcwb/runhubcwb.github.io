(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  // calendário
  const city=$('#f-city');
  if(city){
    const res=$('#f-result'),empty=$('#f-empty'),nw=$('#f-new');let dist='',onlyNew=false;
    function apply(){
      let n=0;const c=city.value;
      $$('.month').forEach(m=>{let k=0;$$('.race',m).forEach(r=>{
        const ok=(!c||r.dataset.city===c)&&(!dist||r.dataset.dist.split(' ').includes(dist))&&(!onlyNew||r.dataset.new==='1');
        r.hidden=!ok;if(ok)k++;});m.hidden=k===0;$('.n',m).textContent=k;n+=k;});
      const f=c||dist||onlyNew;res.textContent=f?(n+(n===1?' prova encontrada':' provas encontradas')):'';empty.hidden=n>0;
    }
    city.addEventListener('change',apply);
    $$('#calendario .fchips .fchip:not(.fnew)').forEach(b=>b.addEventListener('click',()=>{
      $$('#calendario .fchips .fchip:not(.fnew)').forEach(x=>x.classList.remove('on'));b.classList.add('on');dist=b.dataset.d;apply();}));
    nw.addEventListener('click',()=>{onlyNew=!onlyNew;nw.classList.toggle('on',onlyNew);apply();});
  }
  // pódio (abas)
  $$('.ptab').forEach(t=>t.addEventListener('click',()=>{
    $$('.ptab').forEach(x=>x.classList.toggle('on',x===t));
    $$('.ppanel').forEach(p=>p.classList.toggle('on',p.id==='p-'+t.dataset.p));}));
  // agenda: um menu aberto por vez; fecha ao clicar fora ou Esc
  const cals=$$('details.cal');
  cals.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)cals.forEach(o=>{if(o!==d)o.open=false;});}));
  document.addEventListener('click',e=>{cals.forEach(d=>{if(d.open&&!d.contains(e.target))d.open=false;});});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cals.forEach(d=>d.open=false);});
  // histórico: filtros
  const rr=$('#r-race');
  if(rr){
    const res=$('#r-result'),empty=$('#r-empty');let dist='';
    function apply(){
      let n=0;const v=rr.value;
      $$('.rwk').forEach(w=>{let k=0;$$('.rres',w).forEach(c=>{const ok=(!v||c.dataset.race===v)&&(!dist||c.dataset.dist===dist);c.hidden=!ok;if(ok)k++;});
        w.hidden=k===0;$('.n',w).textContent=k;n+=k;});
      res.textContent=(v||dist)?(n+(n===1?' resultado':' resultados')):'';empty.hidden=n>0;
    }
    rr.addEventListener('change',apply);
    $$('.fchips .fchip').forEach(b=>b.addEventListener('click',()=>{$$('.fchips .fchip').forEach(x=>x.classList.remove('on'));b.classList.add('on');dist=b.dataset.d;apply();}));
  }
})();
/* Minha temporada: armazenamento local (só neste aparelho) + estrelas + contador no menu */
(function(){
  const KEY='rh-temporada-v1';
  function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}document.dispatchEvent(new CustomEvent('rh-season'));}
  let RACES={};const el=document.getElementById('rh-races');
  if(el)try{JSON.parse(el.textContent).forEach(r=>RACES[r.id]=r);}catch(e){}
  const S={all:read,has:id=>id in read(),races:RACES,
    toggle(id){const v=read();if(v[id])delete v[id];else{const r=RACES[id];if(!r)return;v[id]={n:r.n,d:r.d,c:r.c,dist:r.dist};}write(v);},
    remove(id){const v=read();delete v[id];write(v);}};
  window.RHSeason=S;
  function sync(){
    const v=read(),t=new Date(),ti=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'),n=Object.values(v).filter(r=>r&&r.d>=ti).length,b=document.querySelectorAll('#season-badge,[data-badge]');
    b.forEach(x=>{x.textContent=n;x.hidden=n===0;});
    document.querySelectorAll('.star').forEach(s=>{const on=s.dataset.id in v;s.classList.toggle('on',on);s.setAttribute('aria-pressed',on);s.querySelector('span').textContent='Vou correr';});
  }
  document.addEventListener('click',e=>{const s=e.target.closest('.star');if(s){e.preventDefault();S.toggle(s.dataset.id);}});
  document.addEventListener('rh-season',sync);window.addEventListener('storage',sync);sync();
})();
