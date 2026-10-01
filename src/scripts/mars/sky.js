
export function initMarsSky(scope) {
(function () {
  'use strict';
  const $=id=>document.getElementById(id), model=window.MarsSkyModel;
  const {DAY,start,end,position,rate,stationary,opposition}=model;
  const dates=[stationary[0],opposition,stationary[1]], names=['开始逆行','火星冲','恢复顺行'];
  const samples=Array.from({length:661},(_,i)=>start+(end-start)*i/660);
  const points=samples.map(position);
  const lons=points.map(p=>p.longitude), lats=points.map(p=>p.latitude);
  const midLon=(Math.min(...lons)+Math.max(...lons))/2, midLat=(Math.min(...lats)+Math.max(...lats))/2;
  // Same pixels per degree in both axes; no artificial vertical sinusoid or stretch.
  const scale=Math.min(584/(Math.max(...lons)-Math.min(...lons)+5),175/(Math.max(...lats)-Math.min(...lats)+3));
  const project=p=>({x:360-(p.longitude-midLon)*scale,y:144-(p.latitude-midLat)*scale});
  const pointAt=ms=>project(position(ms));
  const dateText=ms=>new Date(ms).toISOString().slice(0,10);
  const pathFor=ts=>ts.map((t,i)=>{const p=pointAt(t);return `${i?'L':'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`;}).join(' ');
  $('sky-reference-path').setAttribute('d',pathFor(samples));
  const segment=(from,to)=>to>from?pathFor([from,...samples.filter(t=>t>from&&t<to),to]):'';
  $('sky-endpoints').innerHTML=[start,end].map((t,i)=>{
    const p=pointAt(t);
    return `<g><circle cx="${p.x}" cy="${p.y}" r="3"/><text x="${p.x}" y="${p.y+(i?-17:27)}" text-anchor="middle" class="skytext sky-endpoint-label">${i?'终点 04.15':'起点 11.01'}</text></g>`;
  }).join('');
  const arrowDates=[(start+stationary[0])/2,opposition,(stationary[1]+end)/2];
  $('sky-directions').innerHTML=arrowDates.map(t=>{
    const p=pointAt(t),next=pointAt(t+DAY/4),angle=Math.atan2(next.y-p.y,next.x-p.x)*180/Math.PI;
    return `<path d="M-5,-3 L0,0 L-5,3" transform="translate(${p.x} ${p.y}) rotate(${angle})" stroke="${rate(t)<0?'#ffbd85':'#d8e7ed'}"/>`;
  }).join('');
  $('sky-waypoints').innerHTML=dates.map((t,i)=>{
    const p=pointAt(t), offset=i===1?-40:36;
    return `<g><circle cx="${p.x}" cy="${p.y}" r="3.5"/><line x1="${p.x}" y1="${p.y+(offset>0?7:-7)}" x2="${p.x}" y2="${p.y+offset-(offset>0?15:-6)}" stroke="#d2c5b9" opacity=".65"/><text x="${p.x}" y="${p.y+offset}" class="skytext" text-anchor="middle">${names[i]}</text></g>`;
  }).join('');
  // Sparse coordinate references remain fixed to the background as time changes.
  const grid=[];
  for(let lon=Math.ceil(Math.min(...lons)/5)*5;lon<=Math.max(...lons);lon+=5) {
    const x=project({longitude:lon,latitude:midLat}).x;
    grid.push(`<line x1="${x}" x2="${x}" y1="58" y2="237" stroke="#dce5eb" opacity=".10"/><text x="${x}" y="259" text-anchor="middle" class="skytext">${lon}°</text>`);
  }
  $('sky-ticks').innerHTML=grid.join('');
  $('sky-scale').innerHTML=`<path d="M24 273v5h${2*scale}v-5" fill="none" stroke="#dce5eb"/><text x="${24+scale}" y="265" text-anchor="middle" class="skytext">2°</text><text x="696" y="282" class="skytext" text-anchor="end">黄经 · J2000</text>`;
  const orbit=window.MarsOrbitControl;
  if(!orbit)return;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  // Match the three shared events, rather than compressing a full synodic
  // cycle into a short opposition window. Outside the window, show no marker.
  const orbitDates=[window.MarsModel.stops[2][1],window.MarsModel.OPPOSITION,window.MarsModel.stops[4][1]];
  function interpolate(value,from,to){
    const i=value<=from[1]?0:1;
    return to[i]+(value-from[i])/(from[i+1]-from[i])*(to[i+1]-to[i]);
  }
  const timeForDay=day=>interpolate(day,orbitDates,dates);
  const dayForTime=time=>clamp(interpolate(time,dates,orbitDates),0,orbit.CYCLE);
  const windowNote=document.createElement('p');windowNote.className='sky-window-note';windowNote.setAttribute('role','status');$('sky-map').after(windowNote);
  function render(day=orbit.getDay()) {
    const time=timeForDay(day);
    const visible=time>=start&&time<=end,shown=clamp(time,start,end);
    // Separate prograde legs so no line bridges across the retrograde interval.
    $('sky-full-path').setAttribute('d',segment(start,Math.min(shown,stationary[0]))+' '+segment(stationary[1],shown));
    $('sky-retro-path').setAttribute('d',segment(stationary[0],Math.min(shown,stationary[1])));
    const p=pointAt(shown), velocity=rate(time);
    $('sky-mars').style.display=visible?'':'none';
    windowNote.hidden=visible;
    windowNote.textContent=time<start?'当前构型早于本图展示时段，继续播放可进入逆行观察区间。':'当前构型晚于本图展示时段，可点击“冲”返回逆行观察区间。';
    $('sky-mars').setAttribute('transform',`translate(${p.x} ${p.y})`);
    const dateOutput=$('sky-date');
    if(dateOutput)dateOutput.textContent=visible?dateText(time)+' UTC · 事件对应':'图示时段：2024.11—2025.04';
    const status=!visible?'超出图示时段':Math.abs(velocity)<.004?'留点附近':velocity<0?'逆行 · 向西 →':'顺行 · 向东 ←';
    if($('sky-status').textContent!==status) $('sky-status').textContent=status;
    document.querySelectorAll('[data-sky-event]').forEach((b,i)=>b.classList.toggle('active',Math.abs(time-dates[i])<DAY));
  }
  $('trail-toggle').onchange=e=>{$('trail').style.display=e.target.checked?'':'none';};
  document.querySelectorAll('[data-sky-event]').forEach((button,i)=>{
    button.textContent=names[i]+' · '+dateText(dates[i]).slice(5).replace('-','.');
    button.onclick=()=>orbit.setDay(dayForTime(dates[i]),true);
  });
  scope.listen(window, 'mars-orbit-timechange',event=>render(event.detail.day));
  scope.expose('MarsSkyView', {pointAt,scale,timeForDay,dayForTime});
  render();
})();
}
