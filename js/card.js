/* Run Hub CWB · cards 1080x1920 para stories, gerados no navegador com <canvas> */
(function(){
  'use strict';
  const W=1080,H=1920,M=110,C={bg:'#1C1C1E',bg2:'#26262A',line:'#3E3E44',iv:'#F2EFE8',mut:'#A9A69F',co:'#FF4D6D',gold:'#D4AF37',silver:'#C0C0C0',bronze:'#CD7F32'};
  const BB='"Bebas Neue", Impact, sans-serif',MS='Montserrat, system-ui, sans-serif';
  let ready=null;
  function prep(){
    if(ready)return ready;
    const logo=new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src='img/rh_logo.png';});
    const f=document.fonts?Promise.all([document.fonts.load(`400 100px "Bebas Neue"`),document.fonts.load(`800 40px Montserrat`),document.fonts.load(`600 40px Montserrat`)]).then(()=>document.fonts.ready):Promise.resolve();
    return ready=Promise.all([logo,f]).then(([l])=>l);
  }
  function base(ctx,logo,logoW){
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const g=ctx.createRadialGradient(W*.85,H*.12,40,W*.85,H*.12,900);g.addColorStop(0,'rgba(255,77,109,.16)');g.addColorStop(1,'rgba(255,77,109,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.lineWidth=5;[[1,.55],[2,.33],[3,.16]].forEach(([k,a])=>{ctx.strokeStyle=`rgba(255,77,109,${a})`;ctx.beginPath();const y=1540+k*48;ctx.moveTo(-40,y);ctx.bezierCurveTo(300,y-150,720,y+90,W+40,y-190);ctx.stroke();});
    const lw=logoW||300,lh=lw*logo.naturalHeight/logo.naturalWidth;ctx.drawImage(logo,(W-lw)/2,120,lw,lh);
    return 120+lh;
  }
  function sp(ctx,t,x,y,ls,align){ // texto com espaçamento entre letras
    const w=[...t].reduce((s,ch)=>s+ctx.measureText(ch).width+ls,-ls);let cx=align==='center'?x-w/2:align==='right'?x-w:x;
    const a=ctx.textAlign;ctx.textAlign='left';[...t].forEach(ch=>{ctx.fillText(ch,cx,y);cx+=ctx.measureText(ch).width+ls;});ctx.textAlign=a;return w;
  }
  function fit(ctx,t,maxW,size,min,font){ // diminui a fonte; se ainda não couber, corta com reticências
    let s=size;ctx.font=font(s);while(s>min&&ctx.measureText(t).width>maxW){s-=1;ctx.font=font(s);}
    if(ctx.measureText(t).width<=maxW)return t;let u=t;while(u.length>1&&ctx.measureText(u+'…').width>maxW)u=u.slice(0,-1);return u.trimEnd()+'…';
  }
  function wrap(ctx,t,maxW,maxLines){const ws=t.split(' '),L=[];let cur='';
    ws.forEach(w=>{const n=cur?cur+' '+w:w;if(ctx.measureText(n).width>maxW&&cur){L.push(cur);cur=w;}else cur=n;});if(cur)L.push(cur);
    if(L.length>maxLines){const k=L.slice(0,maxLines);let last=k[maxLines-1];while(ctx.measureText(last+'…').width>maxW)last=last.slice(0,-1);k[maxLines-1]=last+'…';return k;}return L;}
  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function footer(ctx){
    ctx.textAlign='center';ctx.fillStyle=C.iv;ctx.font=`800 40px ${MS}`;sp(ctx,'runhubcwb.github.io',W/2,1760,1,'center');
    ctx.fillStyle=C.co;ctx.font=`700 34px ${MS}`;ctx.fillText('@runhubcwb',W/2,1812);
  }
  function eyebrow(ctx,t,y){ctx.fillStyle=C.co;ctx.font=`800 32px ${MS}`;sp(ctx,t.toUpperCase(),W/2,y,7,'center');}
  function canvas(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}

  function drawCalc(d,logo){
    const c=canvas(),x=c.getContext('2d');base(x,logo,300);x.textAlign='center';
    eyebrow(x,'Seu tempo dava pódio?',390);
    x.fillStyle=C.iv;x.font=`400 230px ${BB}`;x.fillText(d.dist,W/2,610);
    x.fillStyle=C.mut;x.font=`700 30px ${MS}`;sp(x,'MEU TEMPO',W/2,700,6,'center');
    x.fillStyle=C.iv;x.font=`400 ${d.time.length>6?250:300}px ${BB}`;x.fillText(d.time,W/2,950);
    x.fillStyle=C.mut;x.font=`700 30px ${MS}`;sp(x,'PACE MÉDIO',W/2,1040,6,'center');
    x.fillStyle=C.co;x.font=`400 150px ${BB}`;x.fillText(d.pace+' /km',W/2,1180);
    if(d.line){
      x.font=`800 50px ${MS}`;const L=wrap(x,d.line,W-2*M-80,3),bh=70+L.length*66+(d.src?60:0),by=1250;
      rr(x,M,by,W-2*M,bh,34);x.fillStyle=C.bg;x.fill();x.fillStyle='rgba(255,77,109,.10)';x.fill();x.lineWidth=4;x.strokeStyle=C.co;x.stroke();
      x.fillStyle=C.iv;L.forEach((l,i)=>x.fillText(l,W/2,by+90+i*66));
      if(d.src){x.fillStyle=C.mut;x.font=`600 24px ${MS}`;x.fillText(fit(x,d.src,W-2*M-80,24,18,s=>`600 ${s}px ${MS}`),W/2,by+bh-38);}
    }
    footer(x);return c;
  }
  function drawSeason(list,logo){
    const c=canvas(),x=c.getContext('2d');base(x,logo,260);x.textAlign='center';
    eyebrow(x,'Minha temporada',360);
    x.fillStyle=C.iv;x.font=`400 170px ${BB}`;x.fillText(String(new Date().getFullYear()),W/2,520);
    const items=list.slice(0,5);let y=600;const rh=164;
    items.forEach((r,i)=>{
      rr(x,M,y,W-2*M,rh-22,26);x.fillStyle=C.bg2;x.fill();x.lineWidth=3;x.strokeStyle=i===0?C.co:C.line;x.stroke();
      x.textAlign='center';x.fillStyle=C.iv;x.font=`400 76px ${BB}`;x.fillText(r.d.slice(8,10),M+80,y+80);
      x.fillStyle=C.co;x.font=`800 22px ${MS}`;x.fillText(['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][+r.d.slice(5,7)-1],M+80,y+112);
      x.textAlign='left';const tx=M+165,tw=W-M-30-tx;
      x.fillStyle=C.iv;x.fillText(fit(x,r.n,tw,38,28,s=>`800 ${s}px ${MS}`),tx,y+62);
      x.fillStyle=C.mut;x.font=`600 26px ${MS}`;x.fillText(fit(x,`${r.c}${r.dist&&r.dist.length?' · '+r.dist.join(' · '):''} · ${r.falta||''}`,tw,26,20,s=>`600 ${s}px ${MS}`),tx,y+104);
      y+=rh;
    });
    if(list.length>5){x.textAlign='center';x.fillStyle=C.mut;x.font=`700 30px ${MS}`;x.fillText(`+ ${list.length-5} ${list.length-5===1?'prova':'provas'}`,W/2,y+30);}
    x.textAlign='center';footer(x);return c;
  }
  function drawTop5(p,logo){
    const c=canvas(),x=c.getContext('2d');base(x,logo,200);x.textAlign='center';
    eyebrow(x,'Top 5 geral',330);
    x.fillStyle=C.iv;x.font=`400 96px ${BB}`;const L=wrap(x,p.nome.toUpperCase(),W-2*M,2);L.forEach((l,i)=>x.fillText(l,W/2,428+i*90));
    let y=428+(L.length-1)*90+62;
    const meta=`${p.data}/${p.ano} · ${p.cidade} · `;x.font=`600 30px ${MS}`;const mw=x.measureText(meta).width;x.font=`800 30px ${MS}`;const dw=x.measureText(p.dist).width;
    x.textAlign='left';const sx=W/2-(mw+dw)/2;x.fillStyle=C.mut;x.font=`600 30px ${MS}`;x.fillText(meta,sx,y);x.fillStyle=C.co;x.font=`800 30px ${MS}`;x.fillText(p.dist,sx+mw,y);
    if(p.parcial){y+=54;x.textAlign='center';x.font=`800 24px ${MS}`;const t='RESULTADO PARCIAL, SUJEITO A ALTERAÇÕES',tw=x.measureText(t).width+40;rr(x,W/2-tw/2,y-32,tw,46,10);x.strokeStyle=C.mut;x.lineWidth=2;x.stroke();x.fillStyle=C.mut;x.fillText(t,W/2,y);}
    y+=50;
    const gap=12,rowH=Math.max(64,Math.min(88,Math.floor(((1630-y)/2-58)/5)-gap)),k=rowH/88,col=[['Masculino',p.top5.M],['Feminino',p.top5.F]];
    col.forEach(([lab,rows])=>{
      x.textAlign='left';x.fillStyle=C.mut;x.font=`800 24px ${MS}`;sp(x,lab.toUpperCase(),M,y+20,5,'left');y+=40;
      rows.slice(0,5).forEach((r,i)=>{
        rr(x,M,y,W-2*M,rowH,20);x.fillStyle='#232326';x.fill();x.lineWidth=3;x.strokeStyle=[C.gold,C.silver,C.bronze][i]||C.line;x.stroke();
        x.textAlign='left';x.fillStyle=[C.gold,C.silver,C.bronze][i]||C.mut;x.font=`800 32px ${MS}`;x.fillText(r.pos+'º',M+26,y+rowH*(r.eq?.59:.64));
        x.textAlign='right';x.fillStyle=C.iv;x.font=`400 ${Math.round(52*k)}px ${BB}`;const tw=x.measureText(r.t).width;x.fillText(r.t,W-M-26,y+rowH*.7);
        x.textAlign='left';const nx=M+92,nw=W-M-26-tw-28-nx;x.fillStyle=C.iv;
        x.fillText(fit(x,r.nome,nw,Math.round(30*k),20,s=>`800 ${s}px ${MS}`),nx,y+rowH*(r.eq?.45:.63));
        if(r.eq){x.fillStyle=C.mut;x.fillText(fit(x,r.eq.toUpperCase(),nw,19,15,s=>`600 ${s}px ${MS}`),nx,y+rowH*.8);}
        y+=rowH+gap;
      });
      y+=18;
    });
    x.textAlign='center';x.fillStyle=C.mut;x.font=`600 22px ${MS}`;
    x.fillText(fit(x,`Fonte: resultados oficiais (${p.plat}) · tempo ${p.tempo} · classificação geral`,W-2*M,22,17,s=>`600 ${s}px ${MS}`),W/2,Math.max(y+14,1640));
    footer(x);return c;
  }


  const MED=i=>[C.gold,C.silver,C.bronze][i];
  function drawTop10(d,logo){ // d={mes,ano,dist,g,rows,provas}
    const c=canvas(),x=c.getContext('2d');base(x,logo,180);x.textAlign='center';
    eyebrow(x,`Mais rápid${d.g==='F'?'as':'os'} de ${d.mes} ${d.ano}`,330);
    x.fillStyle=C.iv;x.font=`400 150px ${BB}`;const t1=d.dist+' ',t2=d.g==='F'?'FEMININO':'MASCULINO';
    const w1=x.measureText(t1).width,w2=x.measureText(t2).width,sx=W/2-(w1+w2)/2;x.textAlign='left';x.fillStyle=C.co;x.fillText(t1,sx,478);x.fillStyle=C.iv;x.fillText(t2,sx+w1,478);
    x.textAlign='center';x.fillStyle=C.mut;x.font=`600 28px ${MS}`;x.fillText(`Top 10 do mês · ${d.provas} ${d.provas===1?'prova':'provas'} em Curitiba, RMC e litoral`,W/2,536);
    const n=d.rows.length,gap=12,rowH=Math.min(96,Math.floor((1630-580)/Math.max(n,1))-gap);let y=580;
    d.rows.forEach((r,i)=>{
      const med=r.pos<=3?MED(r.pos-1):null;
      rr(x,M-20,y,W-2*M+40,rowH,20);x.fillStyle='#232326';x.fill();x.lineWidth=3;x.strokeStyle=med||C.line;x.stroke();
      x.textAlign='left';x.fillStyle=med||C.mut;x.font=`800 34px ${MS}`;x.fillText(r.pos+'º',M+4,y+rowH*.62);
      x.textAlign='right';x.fillStyle=C.iv;x.font=`400 58px ${BB}`;const tw=x.measureText(r.t).width;x.fillText(r.t,W-M-6,y+rowH*.7);
      x.textAlign='left';const nx=M+86,nw=W-M-6-tw-26-nx;x.fillStyle=C.iv;
      x.fillText(fit(x,r.nome,nw,31,20,s=>`800 ${s}px ${MS}`),nx,y+rowH*.45);
      x.fillStyle=C.mut;x.fillText(fit(x,`${r.eq?r.eq.toUpperCase()+' · ':''}${r.curto} ${r.data}`,nw,20,15,s=>`600 ${s}px ${MS}`),nx,y+rowH*.78);
      y+=rowH+gap;
    });
    x.textAlign='center';x.fillStyle=C.mut;x.font=`600 22px ${MS}`;
    x.fillText(fit(x,'Fonte: resultados oficiais · tempo bruto · melhor tempo de cada atleta no mês',W-2*M,22,17,s=>`600 ${s}px ${MS}`),W/2,Math.max(y+16,1650));
    footer(x);return c;
  }
  function drawRank(d,logo){ // d={pos,g,mes,ano,dist,nome,eq,t,prova,data,cidade,total}
    const c=canvas(),x=c.getContext('2d');base(x,logo,220);x.textAlign='center';const med=d.pos<=3?MED(d.pos-1):C.iv;
    eyebrow(x,`Mais rápidos do mês · ${d.mes} ${d.ano}`,380);
    x.fillStyle=med;x.font=`400 400px ${BB}`;x.fillText(d.pos+'º',W/2,760);
    x.fillStyle=C.iv;x.font=`800 54px ${MS}`;x.fillText(`mais rápid${d.g==='F'?'a':'o'} de ${d.mes.toLowerCase()}`,W/2,850);
    x.fillStyle=C.co;x.font=`400 96px ${BB}`;sp(x,`${d.dist} · ${d.g==='F'?'FEMININO':'MASCULINO'}`,W/2,960,3,'center');
    rr(x,M,1020,W-2*M,470,34);x.fillStyle='#232326';x.fill();x.lineWidth=4;x.strokeStyle=d.pos<=3?med:C.co;x.stroke();
    x.fillStyle=C.iv;x.font=`800 54px ${MS}`;const L=wrap(x,d.nome.toUpperCase(),W-2*M-80,2);L.forEach((l,i)=>x.fillText(l,W/2,1100+i*62));
    let y=1100+(L.length-1)*62;
    if(d.eq){y+=50;x.fillStyle=C.mut;x.fillText(fit(x,d.eq.toUpperCase(),W-2*M-80,28,20,s=>`700 ${s}px ${MS}`),W/2,y);}
    x.fillStyle=C.iv;x.font=`400 ${d.t.length>5?190:210}px ${BB}`;x.fillText(d.t,W/2,y+215);
    x.fillStyle=C.mut;x.fillText(fit(x,`${d.prova} · ${d.data} · ${d.cidade}`,W-2*M-80,28,19,s=>`600 ${s}px ${MS}`),W/2,1452);
    x.fillStyle=C.mut;x.font=`600 22px ${MS}`;x.fillText('Top 10 do mês em Curitiba, RMC e litoral · tempo bruto, resultados oficiais',W/2,1560);
    footer(x);return c;
  }

  // ---------- modal compartilhar / baixar ----------
  let modal;
  function open(c,fname,title,text){
    if(!modal){modal=document.createElement('div');modal.className='sc-modal';modal.hidden=true;modal.innerHTML='<div class="sc-box" role="dialog" aria-modal="true" aria-label="Card para os stories"><button class="sc-x" type="button" aria-label="Fechar">✕</button><p class="eyebrow">Card para os stories</p><img alt=""><div class="sc-acts"><button class="btn sc-share" type="button" hidden>Compartilhar ↗</button><a class="btn btn-ghost sc-dl">Baixar imagem ↓</a></div><p class="sc-tip">1080 × 1920 px · pronto pros stories do Instagram</p></div>';
      document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.sc-x'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});}
    c.toBlob(b=>{
      const url=URL.createObjectURL(b),img=modal.querySelector('img'),dl=modal.querySelector('.sc-dl'),sh=modal.querySelector('.sc-share');
      if(modal._u)URL.revokeObjectURL(modal._u);modal._u=url;img.src=url;img.alt=title;dl.href=url;dl.download=fname;
      const file=new File([b],fname,{type:'image/png'});
      sh.hidden=!(navigator.canShare&&navigator.canShare({files:[file]}));
      sh.onclick=()=>navigator.share({files:[file],title,text}).catch(()=>{});
      modal.hidden=false;document.documentElement.classList.add('sc-lock');
    },'image/png');
  }
  function close(){if(modal){modal.hidden=true;document.documentElement.classList.remove('sc-lock');}}
  const API={
    render(kind,data){return prep().then(l=>({calc:drawCalc,season:drawSeason,top5:drawTop5,top10:drawTop10,rank:drawRank})[kind](data,l));},
    openCalc(d){return API.render('calc',d).then(c=>open(c,`runhubcwb-${d.dist.toLowerCase()}-${d.time.replace(/:/g,'')}.png`,`Meu ${d.dist}: ${d.time}`,`Meu ${d.dist}: ${d.time} (${d.pace}/km). ${d.line||''} · runhubcwb.github.io`));},
    openSeason(list){return API.render('season',list).then(c=>open(c,'runhubcwb-minha-temporada.png','Minha temporada','Minha temporada de corridas · runhubcwb.github.io'));},
    openTop5(id){const p=PODIUM[id];if(!p)return;return API.render('top5',p).then(c=>open(c,`runhubcwb-top5-${id}.png`,`Top 5 · ${p.nome}`,`Top 5 da ${p.nome} ${p.dist} · runhubcwb.github.io`));},
    openTop10(d){return API.render('top10',d).then(c=>open(c,`runhubcwb-mais-rapidos-${d.mid}-${d.dist.toLowerCase()}-${d.g.toLowerCase()}.png`,`Mais rápidos de ${d.mes} · ${d.dist}`,`Top 10 ${d.dist} ${d.g==='F'?'feminino':'masculino'} de ${d.mes} em Curitiba, RMC e litoral · runhubcwb.github.io`));},
    openRank(d){return API.render('rank',d).then(c=>open(c,`runhubcwb-${d.pos}o-${d.dist.toLowerCase()}-${d.mid}.png`,`${d.pos}º mais rápid${d.g==='F'?'a':'o'} de ${d.mes} · ${d.dist}`,`${d.pos}º mais rápid${d.g==='F'?'a':'o'} de ${d.mes} no ${d.dist}: ${d.t} · runhubcwb.github.io`));},
    calcReady(d){const b=document.getElementById('share-box');if(!b)return;
      if(!d){b.hidden=true;b.innerHTML='';return;}
      b.hidden=false;b.innerHTML=`<div class="sb-in"><p><b>Mostra pra galera:</b> gere um card com seu tempo, pace e a comparação com o top 5.</p><button class="btn" type="button" id="sb-go">Gerar card pros stories ↗</button></div>`;
      b.querySelector('#sb-go').onclick=()=>API.openCalc(d);}
  };
  let PODIUM={};const pe=document.getElementById('rh-podium');if(pe)try{PODIUM=JSON.parse(pe.textContent);}catch(e){}
  document.addEventListener('click',e=>{const b=e.target.closest('.share-top5');if(b)API.openTop5(b.dataset.p);});
  window.RHCard=API;
  if(window.RHLastCalc)API.calcReady(window.RHLastCalc);
})();
