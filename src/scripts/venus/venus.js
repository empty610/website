
export function initVenusSimulation(scope) {
const TAU=Math.PI*2,CYCLE=583.92,VR=.723,INC=3.394*Math.PI/180,NODE=1.34;
    const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    function geo(day){const phaseDay=Math.abs(day-CYCLE)<1e-9?0:((day%CYCLE)+CYCLE)%CYCLE,cycleAngle=phaseDay/CYCLE*TAU,ea=cycleAngle,va=Math.PI+cycleAngle*2,u=va-NODE,cn=Math.cos(NODE),sn=Math.sin(NODE),cu=Math.cos(u),su=Math.sin(u),ci=Math.cos(INC),si=Math.sin(INC),e={x:Math.cos(ea),y:Math.sin(ea),z:0},v={x:VR*(cn*cu-sn*su*ci),y:VR*(sn*cu+cn*su*ci),z:VR*su*si},g={x:v.x-e.x,y:v.y-e.y,z:v.z},s={x:-e.x,y:-e.y,z:0},ve={x:e.x-v.x,y:e.y-v.y,z:-v.z},vs={x:-v.x,y:-v.y,z:-v.z},d=Math.hypot(g.x,g.y,g.z),dot=(a,b)=>a.x*b.x+a.y*b.y+(a.z||0)*(b.z||0),cross=(a,b)=>a.x*b.y-a.y*b.x,elong=Math.atan2(cross(s,g),dot(s,g))*180/Math.PI,alpha=Math.acos(clamp(dot(vs,ve)/(Math.hypot(vs.x,vs.y,vs.z)*d),-1,1))*180/Math.PI,lit=(1+Math.cos(alpha*Math.PI/180))/2,uPhase=alpha/100,pt=alpha<=163.6?-4.47+1.03*uPhase+.57*uPhase*uPhase+.13*uPhase*uPhase*uPhase:.98-1.02*uPhase;return{e,v,d,elong,alpha,lit,mag:5*Math.log10(VR*d)+pt,diam:16.68/d,lat:Math.atan2(g.z,Math.hypot(g.x,g.y))*180/Math.PI}}
    function phaseName(f){return f>.92?'近满相':f>.58?'凸相':f>.42?'半圆':f>.08?'弯月相':'极细弯月'}
    function extremum(from,to,key,max=false){let best=null;for(let d=from;d<=to;d+=.1){const g=geo(d),val=key==='elong'?Math.abs(g.elong):g[key];if(!best||(max?val>best.val:val<best.val))best={day:d,val}}return best.day}
    const stops=[['上合',0,'近满相 · 最远'],['东大距',extremum(5,CYCLE/2-5,'elong',true),'昏星最高点'],['昏星最亮',extremum(170,292,'mag'),'粗弯月'],['下合',extremum(220,360,'d'),'最近 · 新相'],['晨星最亮',extremum(292,415,'mag'),'粗弯月'],['西大距',extremum(CYCLE/2+5,CYCLE-5,'elong',true),'晨星最高点'],['回归',CYCLE,'周期完成']];
    let day=92,playing=false,speed=1,last=0;
    const skyPhase=day=>(Math.abs(day-CYCLE)<1e-9?0:((day%CYCLE)+CYCLE)%CYCLE)/CYCLE*TAU;
    const skyLatitude=day=>2.6*Math.sin(skyPhase(day));
    const skyX=x=>360+x*5,skyY=y=>122-y*13.5;
    const fullTrailPoints=Array.from({length:241},(_,i)=>{const d=CYCLE*i/240,g=geo(d);return skyX(g.elong).toFixed(1)+','+skyY(skyLatitude(d)).toFixed(1)}).join(' ');
    function makeStatic(){for(let i=0;i<42;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',(i*149+31)%640);c.setAttribute('cy',(i*83+17)%530);c.setAttribute('r',i%5===0?1.2:.65);c.setAttribute('fill','#fff');$('stars').append(c)}for(const n of [-48,-32,-16,0,16,32,48]){const x=360+n*5,g=document.createElementNS('http://www.w3.org/2000/svg','g');g.innerHTML=`<line x1="${x}" y1="115" x2="${x}" y2="129" class="tick"/><text x="${x}" y="151" text-anchor="middle" class="skytext">${n===0?'太阳':Math.abs(n)+'°'}</text>`;$('sky-ticks').append(g)}for(let i=0;i<30;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',(i*173+45)%720);c.setAttribute('cy',(i*71+29)%210+8);c.setAttribute('r',i%7===0?1.1:.55);c.setAttribute('fill','#dce8ee');c.setAttribute('opacity','.28');$('sky-stars').append(c)}$('events').innerHTML=stops.map((s,i)=>`<button class="event" data-day="${s[1]}"><span class="event-num">${String(i+1).padStart(2,'0')}</span><span class="event-copy"><strong>${s[0]}</strong><small>${s[2]}</small></span><time>第 ${Math.round(s[1])} 天</time></button>`).join('');document.querySelectorAll('.event').forEach(b=>b.onclick=()=>setDay(+b.dataset.day,true))}
    function setLine(el,a,b){el.setAttribute('x1',a.x);el.setAttribute('y1',a.y);el.setAttribute('x2',b.x);el.setAttribute('y2',b.y)}
    function render(){const g=geo(day),to=p=>({x:320+p.x*200,y:265-p.y*200}),e=to(g.e),v=to(g.v),type=g.elong>=0?'昏星':'晨星';$('earth').setAttribute('transform',`translate(${e.x} ${e.y})`);$('venus-dot').setAttribute('transform',`translate(${v.x} ${v.y})`);$('earth-label').setAttribute('x',e.x);$('earth-label').setAttribute('y',e.y-26);$('venus-label').setAttribute('x',v.x);$('venus-label').setAttribute('y',v.y-23);setLine($('earth-sun'),e,{x:320,y:265});setLine($('earth-venus'),e,v);
      $('type').textContent=type;$('type').className='type-badge'+(type==='晨星'?' morning':'');$('phase-label').textContent=phaseName(g.lit);$('lit').textContent=Math.round(g.lit*100)+'% 被照亮';$('mag').textContent=g.mag.toFixed(2);$('elong').textContent=Math.abs(g.elong).toFixed(1)+'°';$('elong-side').textContent=g.elong>=0?'太阳以东':'太阳以西';$('diameter').textContent=g.diam.toFixed(1)+'″';$('distance').textContent=g.d.toFixed(3)+' AU';$('distance-km').textContent=(g.d*149.6).toFixed(0)+' 百万千米';$('observation').innerHTML=`金星作为<strong>${type}</strong>，位于太阳${g.elong>=0?'东':'西'}侧约 ${Math.abs(g.elong).toFixed(0)}°，呈${phaseName(g.lit)}。`;$('day-label').textContent='第 '+Math.round(day)+' 天';
      const r=43,rx=Math.max(.45,r*Math.abs(Math.cos(g.alpha*Math.PI/180))),right=g.elong<0,outer=right?1:0,gibb=g.alpha<90,term=right?(gibb?1:0):(gibb?0:1);$('phase-path').setAttribute('d',`M50 7 A${r} ${r} 0 0 ${outer} 50 93 A${rx} ${r} 0 0 ${term} 50 7Z`);
      $('sky-venus').setAttribute('transform',`translate(${skyX(g.elong)} ${skyY(skyLatitude(day))})`);$('trail').setAttribute('points',fullTrailPoints);document.querySelectorAll('.event').forEach((b,i)=>b.classList.toggle('active',Math.abs(day-stops[i][1])<8))}
    function setPlaying(value){playing=value;last=0;$('play').textContent=value?'Ⅱ':'▶';$('play').setAttribute('aria-label',value?'暂停日心轨道演示':'播放日心轨道演示');$('play').setAttribute('aria-pressed',String(value));const sun=$('orbit-sun');sun.classList.toggle('is-playing',value);sun.setAttribute('aria-label',value?'暂停日心轨道演示':'播放日心轨道演示');sun.setAttribute('aria-pressed',String(value))}
    function setDay(value,pause=false){if(pause)setPlaying(false);day=clamp(value,0,CYCLE);$('day').value=day;render()}
    const togglePlaying=()=>setPlaying(!playing);
    function frame(t){if(playing&&!document.hidden){if(last){day+=((t-last)/40)*.55*speed;if(day>=CYCLE)day%=CYCLE;$('day').value=day;render()}last=t}else last=0;scope.requestAnimationFrame(frame)}
    $('play').onclick=togglePlaying;$('orbit-sun').onclick=togglePlaying;$('orbit-sun').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();togglePlaying()}};$('reset').onclick=()=>setDay(0,true);$('day').oninput=e=>setDay(+e.target.value,true);$('trail-toggle').onchange=e=>$('trail').style.display=e.target.checked?'':'none';document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=+b.dataset.speed;document.querySelectorAll('[data-speed]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))})});
    const intro=$('venus-intro'),introToggle=$('intro-toggle');
    function setIntro(open){intro.classList.toggle('is-open',open);introToggle.setAttribute('aria-expanded',String(open));introToggle.setAttribute('aria-label',open?'收起金星介绍':'展开金星介绍');$('intro-toggle-hint').textContent=open?'点此收起介绍':'点此展开介绍'}
    introToggle.onclick=()=>setIntro(!intro.classList.contains('is-open'));setIntro(false);
    const imageDialog=$('image-dialog'),imageDialogImage=$('image-dialog-image'),imageDialogCaption=$('image-dialog-caption');let dialogControlsTimer;
    function revealDialogControls(){scope.clearTimeout(dialogControlsTimer);imageDialog.classList.add('is-controls-visible');if(imageDialog.open)dialogControlsTimer=scope.setTimeout(()=>imageDialog.classList.remove('is-controls-visible'),2000)}
    function closeImageDialog(){scope.clearTimeout(dialogControlsTimer);imageDialog.classList.remove('is-controls-visible');imageDialog.close()}
    function openImageDialog(card){imageDialogImage.src=card.dataset.imageFull;imageDialogImage.alt=card.querySelector('img').alt;const explanation=card.querySelector('.terrain-copy'),dialogTitle=card.dataset.imageDialogTitle;if(explanation){const copy=explanation.cloneNode(true);copy.querySelector('.terrain-toggle')?.remove();copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));imageDialogCaption.replaceChildren(copy)}else if(dialogTitle)imageDialogCaption.innerHTML=`<strong class="dialog-title">${dialogTitle}</strong><span class="dialog-subtitle">${card.dataset.imageSubtitle}</span>`;else imageDialogCaption.textContent=card.dataset.imageCaption;imageDialog.showModal();revealDialogControls()}
    document.querySelectorAll('[data-image-full]').forEach(card=>{card.onclick=()=>openImageDialog(card);if(card.classList.contains('terrain-card')){card.tabIndex=0;scope.listen(card, 'keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openImageDialog(card)}})}});
    document.querySelectorAll('.terrain-grid .terrain-card').forEach((card,index)=>{
      const copy=card.querySelector('.terrain-copy'),paragraphs=copy.querySelectorAll(':scope > p');
      if(!paragraphs.length)return;
      const description=document.createElement('div');
      description.className='terrain-description';description.id=`terrain-description-${index+1}`;
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
    $('image-dialog-close').onclick=closeImageDialog;
    imageDialog.onclick=e=>{if(e.target===imageDialog)closeImageDialog()};
    ['pointermove','wheel','keydown','touchstart'].forEach(type=>scope.listen(imageDialog, type,revealDialogControls,{passive:true}));
    scope.listen(imageDialog, 'close',()=>{scope.clearTimeout(dialogControlsTimer);imageDialog.classList.remove('is-controls-visible')});
    makeStatic();render();scope.requestAnimationFrame(frame);
}
