/* Run Hub CWB · Mais rápidos do mês: seletor de mês, abas de distância, top 10 M/F e cards pros stories */
(function(){
  'use strict';
  const el=document.getElementById('rh-rank');if(!el)return;
  let D;try{D=JSON.parse(el.textContent);}catch(e){return;}
  const $=s=>document.querySelector(s),sel=$('#rk-month'),tabs=$('#rk-dist'),cols=$('#rk-cols'),meta=$('#rk-meta');
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY='rh-rank-v1';let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
  if(!D.meses.length){cols.innerHTML='<p class="empty">Ainda não há resultados neste mês.</p>';return;}
  sel.innerHTML=D.meses.map(m=>`<option value="${m.id}">${m.nome} ${m.ano}</option>`).join('');
  let mi=Math.max(0,D.meses.findIndex(m=>m.id===st.m)),dist=st.d;
  sel.value=D.meses[mi].id;
  const SH='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function save(){try{localStorage.setItem(KEY,JSON.stringify({m:D.meses[mi].id,d:dist}));}catch(e){}}
  function render(){
    const m=D.meses[mi],ds=Object.keys(m.dist);if(!ds.includes(dist))dist=ds[0];
    tabs.innerHTML=ds.map(d=>`<button type="button" role="tab" class="rk-tab" aria-selected="${d===dist}" data-d="${d}">${d}</button>`).join('');
    const np=m.np[dist];meta.textContent=`${m.nome} ${m.ano} · ${dist} · ${np} ${np===1?'prova somada':'provas somadas'}`;
    cols.innerHTML=['F','M'].filter(g=>(m.dist[dist][g]||[]).length).map(g=>{
      const rows=m.dist[dist][g];
      return `<div class="rk-col"><div class="rk-h"><h3>${g==='F'?'Feminino':'Masculino'}</h3><button class="btn btn-sm rk-all" type="button" data-g="${g}">Compartilhar top ${rows.length} ↗</button></div>
      <ol class="rk-list">${rows.map((r,i)=>`<li class="${['gold','silver','bronze'][r.pos-1]||''}">
        <span class="pos">${r.pos}º</span>
        <span class="nm">${esc(r.nome)}<small>${r.eq?esc(r.eq)+' · ':''}${esc(r.curto)} · ${r.data}${r.parcial?' · parcial':''}</small></span>
        <span class="t">${r.t}</span>
        <button class="rk-sh" type="button" data-g="${g}" data-i="${i}" aria-label="Compartilhar ${r.pos}º lugar de ${esc(r.nome)}" title="Gerar card pros stories">${SH}</button></li>`).join('')}</ol></div>`;}).join('');
    save();
  }
  sel.addEventListener('change',()=>{mi=D.meses.findIndex(m=>m.id===sel.value);render();});
  tabs.addEventListener('click',e=>{const b=e.target.closest('.rk-tab');if(b){dist=b.dataset.d;render();}});
  cols.addEventListener('click',e=>{
    const m=D.meses[mi],a=e.target.closest('.rk-all'),s=e.target.closest('.rk-sh');if(!window.RHCard)return;
    if(a){const g=a.dataset.g;RHCard.openTop10({mid:m.id,mes:m.nome,ano:m.ano,dist,g,rows:m.dist[dist][g],provas:m.np[dist]});}
    if(s){const g=s.dataset.g,r=m.dist[dist][g][+s.dataset.i];RHCard.openRank(Object.assign({mid:m.id,mes:m.nome,ano:m.ano,dist,g},r));}
  });
  render();
})();
