/* Run Hub CWB · previsão do tempo no dia da prova (Open-Meteo, sem chave). Só aparece até 14 dias antes; em caso de erro, some. */
(function(){
  'use strict';
  const S=window.RHSeason;if(!S)return;const R=S.races,HORIZON=14,API='https://api.open-meteo.com/v1/forecast';
  const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());};
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const days=s=>{const [y,m,d]=s.split('-').map(Number);return Math.round((new Date(y,m-1,d)-today())/864e5);};
  const pend={};
  function get(r){
    const key=`rh-wx:${r.lat},${r.lon}:${iso(today())}`;
    try{const c=sessionStorage.getItem(key);if(c)return Promise.resolve(JSON.parse(c));}catch(e){}
    if(pend[key])return pend[key];
    const q=`${API}?latitude=${r.lat}&longitude=${r.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m,weather_code&timezone=America%2FSao_Paulo&forecast_days=16`;
    const ctl=new AbortController();setTimeout(()=>ctl.abort(),8000);
    return pend[key]=fetch(q,{signal:ctl.signal}).then(x=>{if(!x.ok)throw new Error(x.status);return x.json();}).then(j=>{
      if(!j.daily||!j.daily.time)throw new Error('formato');try{sessionStorage.setItem(key,JSON.stringify(j));}catch(e){}return j;});
  }
  function icon(c){
    if(c==null)return '';
    if(c===0)return ['☀️','Céu limpo'];if(c<=2)return ['🌤️','Poucas nuvens'];if(c===3)return ['☁️','Nublado'];
    if(c===45||c===48)return ['🌫️','Neblina'];if(c>=51&&c<=57)return ['🌦️','Garoa'];if((c>=61&&c<=67)||(c>=80&&c<=82))return ['🌧️','Chuva'];
    if(c>=71&&c<=77||c===85||c===86)return ['🌨️','Neve'];if(c>=95)return ['⛈️','Tempestade'];return ['☁️','Nublado'];
  }
  const n=v=>typeof v==='number'&&isFinite(v);
  function html(r,j){
    const D=j.daily,i=D.time.indexOf(r.d);if(i<0)return null;
    const mx=D.temperature_2m_max[i],mn=D.temperature_2m_min[i],pr=D.precipitation_probability_max[i],wd=D.wind_speed_10m_max[i],[ic,lb]=icon(D.weather_code[i])||[];
    if(!n(mx)||!n(mn))return null;
    let at='';
    if(r.st&&j.hourly){const k=j.hourly.time.indexOf(`${r.d}T${r.st.slice(0,2)}:00`);const t=k>=0?j.hourly.temperature_2m[k]:null;
      if(n(t))at=`<span class="wx-at">Na largada (${r.st.slice(0,2)}h${r.st.slice(2)!=='00'?r.st.slice(2):''}): <b>${Math.round(t)}°C</b></span>`;}
    return `<div class="wx-m"><span class="wx-i" role="img" aria-label="${lb}">${ic}</span><span class="wx-t"><b>${Math.round(mn)}° / ${Math.round(mx)}°C</b><small>${lb}</small></span>`+
      `<span class="wx-k">${n(pr)?`<span title="Chance de chuva">💧 ${pr}%</span>`:''}${n(wd)?`<span title="Vento máximo">💨 ${Math.round(wd)} km/h</span>`:''}</span></div>${at}<p class="wx-s">Previsão Open-Meteo para ${r.c} · pode mudar até o dia</p>`;
  }
  function fill(root){
    (root||document).querySelectorAll('.wx[data-id]').forEach(el=>{
      const r=R[el.dataset.id];if(!r||r.lat==null){el.hidden=true;return;}
      const k=days(r.d);if(k<0||k>HORIZON){el.hidden=true;el.innerHTML='';return;}
      get(r).then(j=>{const h=html(r,j);if(h){el.innerHTML=h;el.hidden=false;}else el.hidden=true;}).catch(()=>{el.hidden=true;el.innerHTML='';});
    });
  }
  window.RHWeather={fill};
  document.addEventListener('rh-season-rendered',()=>fill(document.getElementById('season')));
  fill();
})();
