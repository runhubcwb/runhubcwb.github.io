
(function(){
  const city=document.getElementById('f-city'),res=document.getElementById('f-result'),empty=document.getElementById('f-empty'),nw=document.getElementById('f-new');
  let dist='',onlyNew=false;
  function apply(){
    let n=0;const c=city.value;
    document.querySelectorAll('.month').forEach(m=>{
      let k=0;m.querySelectorAll('.race').forEach(r=>{
        const ok=(!c||r.dataset.city===c)&&(!dist||r.dataset.dist.split(' ').includes(dist))&&(!onlyNew||r.dataset.new==='1');
        r.hidden=!ok;if(ok)k++;});
      m.hidden=k===0;m.querySelector('.n').textContent=k;n+=k;});
    const f=c||dist||onlyNew;res.textContent=f?(n+(n===1?' prova encontrada':' provas encontradas')):'';empty.hidden=n>0;
  }
  city.addEventListener('change',apply);
  document.querySelectorAll('.fchips .fchip:not(.fnew)').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.fchips .fchip:not(.fnew)').forEach(x=>x.classList.remove('on'));b.classList.add('on');dist=b.dataset.d;apply();}));
  nw.addEventListener('click',()=>{onlyNew=!onlyNew;nw.classList.toggle('on',onlyNew);apply();});
  document.querySelectorAll('.ptab').forEach(t=>t.addEventListener('click',()=>{
    document.querySelectorAll('.ptab').forEach(x=>x.classList.toggle('on',x===t));
    document.querySelectorAll('.ppanel').forEach(p=>p.classList.toggle('on',p.id==='p-'+t.dataset.p));}));
})();
