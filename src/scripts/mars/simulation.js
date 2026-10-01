
export function initMarsSimulation(scope) {
(function () {
  'use strict';
  const TAU = Math.PI * 2, EARTH_YEAR = 365.256, MARS_YEAR = 686.980, R = 1.52371;
  const CYCLE = 1 / (1 / EARTH_YEAR - 1 / MARS_YEAR), OPPOSITION = CYCLE / 2;
  const $ = id => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  // Circular, coplanar heliocentric orbits. Day zero is a hypothetical conjunction.
  function geo(day) {
    const ea = TAU * day / EARTH_YEAR, ma = Math.PI + TAU * day / MARS_YEAR;
    const e = { x: Math.cos(ea), y: Math.sin(ea) };
    const m = { x: R * Math.cos(ma), y: R * Math.sin(ma) };
    const gx = m.x - e.x, gy = m.y - e.y, d = Math.hypot(gx, gy);
    const elong = Math.atan2(-e.x * gy + e.y * gx, -e.x * gx - e.y * gy) * 180 / Math.PI;
    const alpha = Math.acos(clamp((m.x * gx + m.y * gy) / (R * d), -1, 1)) * 180 / Math.PI;
    const lambda = Math.atan2(gy, gx);
    const ne = TAU / EARTH_YEAR, nm = TAU / MARS_YEAR;
    const vx = -R * nm * Math.sin(ma) + ne * Math.sin(ea);
    const vy = R * nm * Math.cos(ma) - ne * Math.cos(ea);
    const rate = (gx * vy - gy * vx) / (d * d) * 180 / Math.PI;
    return { e, m, d, elong, alpha, lambda, rate, lit: (1 + Math.cos(alpha * Math.PI / 180)) / 2,
      mag: -1.52 + 5 * Math.log10(R * d) + .016 * alpha, diam: 9.36 / d };
  }
  const quadrature = (Math.PI - Math.acos(1 / R)) / TAU * CYCLE;
  const ne = TAU / EARTH_YEAR, nm = TAU / MARS_YEAR;
  const stationary = (Math.PI - Math.acos((R * R * nm + ne) / (R * (nm + ne)))) / TAU * CYCLE;
  const stops = [
    ['合', 0, '太阳另一侧 · 难以观测'],
    ['西方照', quadrature, '太阳以西 90° · 后半夜'],
    ['开始逆行', stationary, '留点 · 从顺行转为逆行'],
    ['冲', OPPOSITION, '与太阳相对 · 本模型中最近最亮'],
    ['结束逆行', CYCLE - stationary, '留点 · 恢复顺行'],
    ['东方照', CYCLE - quadrature, '太阳以东 90° · 前半夜'],
    ['再次合', CYCLE, '完成一个会合周期']
  ];
  scope.expose('MarsModel', { geo, CYCLE, OPPOSITION, stops });
  let day = OPPOSITION, playing = false, speed = 1, last = 0;
  function buildStatic() {
    $('day').max = CYCLE;
    $('day').value = day;
    document.querySelector('.mars-orbit').setAttribute('r', R * 137);
    $('events').innerHTML = stops.map((s, i) => `<button type="button" class="event" data-day="${s[1]}"><span class="event-num">${String(i + 1).padStart(2, '0')}</span><span class="event-copy"><strong>${s[0]}</strong><small>${s[2]}</small></span><time>第 ${Math.round(s[1])} 天</time></button>`).join('');
    document.querySelectorAll('.event').forEach(b => b.onclick = () => setDay(+b.dataset.day, true));
    const labels = document.querySelectorAll('.timeline .labels span');
    labels[1].style.left = quadrature / CYCLE * 100 + '%';
    labels[3].style.left = (1 - quadrature / CYCLE) * 100 + '%';
  }
  function line(id, a, b) { const el = $(id); Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}).forEach(([k,v])=>el.setAttribute(k,v)); }
  function render() {
    const g = geo(day), to = p => ({ x: 320 + p.x * 137, y: 265 - p.y * 137 });
    const e = to(g.e), m = to(g.m), elong = Math.abs(g.elong);
    const west = g.elong < 0, atOpposition = elong > 170, nearSun = elong < 10;
    const type = nearSun ? '合附近' : atOpposition ? '冲附近' : west ? '后半夜可见' : '前半夜可见';
    const phase = g.lit > .98 ? '近满相' : '凸相';
    $('earth').setAttribute('transform', `translate(${e.x} ${e.y})`);
    $('mars-dot').setAttribute('transform', `translate(${m.x} ${m.y})`);
    for (const [id,p] of [['earth-label',e],['mars-label',m]]) { $(id).setAttribute('x',p.x); $(id).setAttribute('y',p.y-26); }
    line('earth-sun', e, {x:320,y:265}); line('earth-mars',e,m);
    $('type').textContent = type; $('type').className = 'type-badge' + (west && !nearSun ? ' morning' : '');
    $('phase-label').textContent = phase; $('lit').textContent = (g.lit*100).toFixed(1) + '% 被照亮';
    $('mag').textContent = g.mag.toFixed(2); $('elong').textContent = elong.toFixed(1) + '°';
    $('elong-side').textContent = atOpposition ? '与太阳近乎相对' : nearSun ? '接近太阳方向' : west ? '太阳以西' : '太阳以东';
    $('diameter').textContent = g.diam.toFixed(1) + '″'; $('distance').textContent = g.d.toFixed(3) + ' AU';
    $('distance-km').textContent = (g.d * 149.5978707).toFixed(1) + ' 百万千米';
    const motion = Math.abs(g.rate) < .002 ? '处于留点附近' : g.rate < 0 ? '相对背景恒星逆行' : '相对背景恒星顺行';
    $('observation').textContent = nearSun ? '火星靠近太阳方向，淹没在日光中，难以观测。此时距离较远，视直径较小。' : atOpposition ? `火星在日落前后升起，午夜前后升至高空，几乎整夜可见；${motion}。本模型中，冲时最近、最亮，呈近满相。` : `火星位于太阳${west?'西':'东'}侧 ${elong.toFixed(0)}°，主要在${west?'后':'前'}半夜可见，呈${phase}；${motion}。`;
    $('day-label').textContent = '第 ' + Math.round(day) + ' 天'; $('day').value = day;
    $('day').setAttribute('aria-valuetext', '第 ' + Math.round(day) + ' 个地球日');
    const r=43,rx=Math.max(.45,r*Math.abs(Math.cos(g.alpha*Math.PI/180))),right=west,outer=right?1:0,term=right?1:0;
    $('phase-path').setAttribute('d', `M50 7 A${r} ${r} 0 0 ${outer} 50 93 A${rx} ${r} 0 0 ${term} 50 7Z`);
    document.querySelectorAll('.event').forEach((b,i)=>b.classList.toggle('active',Math.abs(day-stops[i][1])<3));
    window.dispatchEvent(new CustomEvent('mars-orbit-timechange',{detail:{day,cycle:CYCLE,playing}}));
  }
  function setDay(value,pause=false) { if(pause)setPlaying(false);day=clamp(value,0,CYCLE);render(); }
  function setPlaying(value) { playing=value;last=0;$('play').textContent=value?'Ⅱ':'▶';$('play').setAttribute('aria-label',value?'暂停日心轨道与视运动':'播放日心轨道与视运动');$('play').setAttribute('aria-pressed',String(value));const sun=$('orbit-sun');sun.classList.toggle('is-playing',value);sun.setAttribute('aria-label',value?'暂停日心轨道与视运动':'播放日心轨道与视运动');sun.setAttribute('aria-pressed',String(value));window.dispatchEvent(new CustomEvent('mars-orbit-playchange',{detail:{playing}})); }
  function frame(t) { if(playing && !document.hidden) { if(last) { day=(day+Math.min(t-last,100)*.018*speed)%CYCLE;render(); } last=t; } else last=0;scope.requestAnimationFrame(frame); }
  const togglePlaying=()=>setPlaying(!playing);
  $('play').onclick=togglePlaying;
  $('orbit-sun').onclick=togglePlaying;
  $('orbit-sun').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();togglePlaying();}};
  $('reset').onclick=()=>setDay(0,true);
  $('day').oninput=e=>setDay(+e.target.value,true);
  document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=+b.dataset.speed;document.querySelectorAll('[data-speed]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))})});
  const intro=$('mars-intro'),introToggle=$('intro-toggle');
  introToggle.onclick=()=>{const open=!intro.classList.contains('is-open');intro.classList.toggle('is-open',open);introToggle.setAttribute('aria-expanded',String(open));$('mars-intro-content').hidden=!open;introToggle.querySelector('.intro-mark').textContent=open?'−':'＋'};
  const dialog=$('image-dialog'),dialogImage=$('image-dialog-image'),caption=$('image-dialog-caption');
  function formatLandformCaption(text) {
    const sourceStart=text.lastIndexOf(' 来源：');
    const description=sourceStart<0?text:text.slice(0,sourceStart);
    const sentences=description.match(/[^。！？]+[。！？]?/g)||[description];
    const content=document.createElement('div');content.className='landform-dialog-copy';
    for(let i=0;i<sentences.length;i+=2){
      const paragraph=document.createElement('p');
      paragraph.textContent=sentences.slice(i,i+2).join('').trim();
      content.append(paragraph);
    }
    if(sourceStart>=0){
      const source=document.createElement('p');source.className='landform-dialog-source';
      source.textContent=text.slice(sourceStart).trim();content.append(source);
    }
    caption.replaceChildren(content);
  }
  function openImage(card) { dialogImage.src=card.dataset.imageFull;dialogImage.alt=card.querySelector('img').alt;const copy=card.querySelector('.terrain-copy');if(copy){const fullCopy=copy.cloneNode(true);fullCopy.querySelector('.terrain-toggle')?.remove();fullCopy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));caption.replaceChildren(fullCopy)}else formatLandformCaption(card.dataset.imageCaption);dialog.showModal();dialog.classList.add('is-controls-visible'); }
  document.querySelectorAll('[data-image-full]').forEach(card=>{card.onclick=e=>{if(!e.target.closest('a'))openImage(card)};if(card.classList.contains('terrain-card')){card.tabIndex=0;card.setAttribute('role','button');scope.listen(card, 'keydown',e=>{if(e.target===card && (e.key==='Enter'||e.key===' ')){e.preventDefault();openImage(card)}})}});
  document.querySelectorAll('.terrain-grid .terrain-card').forEach((card,index)=>{
    const copy=card.querySelector('.terrain-copy'),paragraphs=copy.querySelectorAll(':scope > p');
    if(!paragraphs.length)return;
    const description=document.createElement('div');
    description.className='terrain-description';description.id=`mars-terrain-description-${index+1}`;
    paragraphs[0].before(description);paragraphs.forEach(p=>description.append(p));
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='terrain-toggle';toggle.textContent='展开介绍';
    toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',description.id);
    toggle.setAttribute('aria-label',`展开${copy.querySelector('h3').textContent}介绍`);
    scope.listen(toggle, 'click',event=>{
      event.stopPropagation();const open=card.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'收起介绍':'展开介绍';
      toggle.setAttribute('aria-label',`${open?'收起':'展开'}${copy.querySelector('h3').textContent}介绍`);
    });
    description.after(toggle);card.classList.add('has-disclosure');
  });
  $('image-dialog-close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
  scope.expose('MarsOrbitControl', {CYCLE,getDay:()=>day,setDay,toggle:()=>setPlaying(!playing),setPlaying,isPlaying:()=>playing});
  buildStatic();render();scope.requestAnimationFrame(frame);
})();
}
