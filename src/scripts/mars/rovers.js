import { assetUrl } from '../../utils/assets.js';

export function initRovers(scope) {
(function(){
  'use strict';
  const data=window.MARS_ROVERS;
  const $=id=>document.getElementById(id);
  if(!$('rover-panel')||!data)return;
  // Photo markup may be absent in older locally edited pages; keep the archive usable.
  const hasSurfacePhoto=['title','image','note','source','expand'].every(part=>$('rover-surface-'+part));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected=data[0],scale=1,panX=0,panY=0,drag=null;
  const viewport=$('route-viewport'),routeImage=$('rover-route-image');
  const tabButtons=[$('pioneer-tab'),$('model-tab'),$('rovers-tab')].filter(Boolean);
  const views=[
    {id:'pioneer-panel',title:'探索火星的历史与展望'},
    {id:'mars-stage',title:'火星三维模型'},
    {id:'rover-panel',title:'巡视器路线与科研成果'}
  ];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=0,activeWaypoint=-1,detailMap=false,pendingFocus=false;
  const markers=document.createElement('div');markers.className='route-markers';viewport.append(markers);
  const placeStatus=document.createElement('span');placeStatus.className='route-place-status';placeStatus.setAttribute('role','status');placeStatus.hidden=true;viewport.append(placeStatus);
  const number=i=>String(i+1).padStart(2,'0');
  function stopMotion(){scope.cancelAnimationFrame(motion);motion=0;}
  function renderMarkers(){
    markers.innerHTML=selected.waypoints.map((p,i)=>detailMap&&!p.detail?'':'<button type="button" class="route-marker" data-place="'+i+'" aria-label="放大查看'+esc(p.name)+'" title="'+esc(p.name)+'" aria-pressed="'+(i===activeWaypoint)+'"><span>'+number(i)+'</span></button>').join('');
    markers.querySelectorAll('button').forEach(b=>b.onclick=()=>focusPlace(Number(b.dataset.place)));
    $('rover-waypoints').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===activeWaypoint)));
    placeStatus.hidden=activeWaypoint<0;placeStatus.textContent=activeWaypoint<0?'':number(activeWaypoint)+' · '+selected.waypoints[activeWaypoint].name;
  }
  function loadRoute(){
    stopMotion();scale=1;panX=panY=0;
    const overview=selected.overviewMap&&!detailMap?selected.overviewMap:null;
    $('rover-route-note').textContent=(overview?overview.note:selected.routeNote)+' 编号标示地点或地貌区域的大致位置，点击编号或下方标签可放大查看。';
    $('rover-credit').textContent=overview?overview.credit:selected.credit;
    $('rover-map-source').href=overview?overview.source:selected.mapSource;
    $('route-loading').hidden=false;viewport.setAttribute('aria-busy','true');
    routeImage.alt=selected.name+'：'+(overview?overview.note:selected.routeTitle);
    routeImage.src=assetUrl('images/mars/rovers/'+(overview?overview.file:selected.id+'.jpg'));renderMarkers();paintImage();
  }
  function focusPlace(index){
    const point=selected.waypoints[index];if(!point)return;
    stopMotion();activeWaypoint=index;const nextDetail=!!point.detail;
    if(nextDetail!==detailMap){detailMap=nextDetail;pendingFocus=true;loadRoute();return;}
    renderMarkers();
    if(!routeImage.complete||!routeImage.naturalWidth){pendingFocus=true;return;}
    pendingFocus=false;
    const p=detailMap?point.detail:point,w=viewport.clientWidth,h=viewport.clientHeight;
    const fit=Math.min(w/routeImage.naturalWidth,h/routeImage.naturalHeight),target=3.5;
    const limitX=Math.max(0,(routeImage.naturalWidth*fit*target-w)/2),limitY=Math.max(0,(routeImage.naturalHeight*fit*target-h)/2);
    const x=Math.max(-limitX,Math.min(limitX,(.5-p.x)*routeImage.naturalWidth*fit*target));
    const y=Math.max(-limitY,Math.min(limitY,(.5-p.y)*routeImage.naturalHeight*fit*target));
    const start={scale,x:panX,y:panY},began=performance.now();
    function frame(now){const t=reducedMotion.matches?1:Math.min(1,(now-began)/700),ease=1-Math.pow(1-t,3);scale=start.scale+(target-start.scale)*ease;panX=start.x+(x-start.x)*ease;panY=start.y+(y-start.y)*ease;paintImage();if(t<1)motion=scope.requestAnimationFrame(frame);else motion=0;}
    motion=scope.requestAnimationFrame(frame);
  }
  let tabTransition=0;
  function showTab(index,focus){
    const current=views.findIndex(view=>!$(view.id).hidden);
    if(current===index){
      const element=$(views[index].id);
      if(!element.classList.contains('tab-view-exit'))return;
      ++tabTransition;element.classList.remove('tab-view-exit');element.classList.add('tab-view-enter');
      $('mars-model-title').textContent=views[index].title;
      tabButtons.forEach((button,i)=>{const active=i===index;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
      if(index===1&&window.MarsModelView)window.MarsModelView.enter();
      if(focus)tabButtons[index].focus();
      return;
    }
    const token=++tabTransition,previous=current<0?null:$(views[current].id),delay=reducedMotion.matches?0:300;
    $('mars-model-title').textContent=views[index].title;
    tabButtons.forEach((b,i)=>{const active=i===index;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    if(focus)tabButtons[index].focus();
    if(current===1&&window.MarsModelView)window.MarsModelView.exit();
    if(previous){previous.classList.remove('tab-view-enter');previous.classList.add('tab-view-exit');}
    scope.setTimeout(()=>{
      if(token!==tabTransition)return;
      views.forEach((view,i)=>{
        const element=$(view.id),active=i===index;
        element.hidden=!active;
        element.classList.remove('tab-view-enter','tab-view-exit');
        if(active)scope.requestAnimationFrame(()=>element.classList.add('tab-view-enter'));
      });
      if(index===1&&window.MarsModelView)window.MarsModelView.enter();
      if(index===2)scope.requestAnimationFrame(centerSelected);
    },delay);
  }
  tabButtons.forEach((button,index)=>{
    button.onclick=()=>showTab(index,false);
    button.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabButtons.length;else if(e.key==='ArrowLeft')next=(index+tabButtons.length-1)%tabButtons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabButtons.length-1;if(next!==undefined){e.preventDefault();showTab(next,true);}};
  });
  function centerSelected(){
    const frame=document.querySelector('.world-map-scroll'),map=$('rover-world-map');
    const x=(selected.lon+180)/360*map.clientWidth;
    if(frame.scrollWidth>frame.clientWidth)frame.scrollLeft=Math.max(0,Math.min(frame.scrollWidth-frame.clientWidth,x-frame.clientWidth/2));
  }
  $('rover-selectors').innerHTML=data.map(r=>'<button type="button" class="rover-selector" data-id="'+r.id+'" style="--pin-color:'+r.color+'" aria-pressed="false"><strong>'+r.name+'</strong><small>'+r.en+'</small></button>').join('');
  $('rover-pins').innerHTML=data.map(r=>'<button type="button" class="rover-pin" data-id="'+r.id+'" aria-label="查看'+r.name+'在'+r.site+'的路线与成果" aria-pressed="false" style="--pin-color:'+r.color+';left:'+((r.lon+180)/360*100)+'%;top:'+((90-r.lat)/180*100)+'%"><span class="pin-name">'+r.name+'</span></button>').join('');
  let grid='';
  for(let lon=-120;lon<=120;lon+=60){const x=(lon+180)/360*1000;grid+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="500"/><text x="'+(x+6)+'" y="486">'+(lon<0?-lon+'°W':lon>0?lon+'°E':'0°')+'</text>';}
  for(const lat of [-60,-30,0,30,60]){const y=(90-lat)/180*500;grid+='<line x1="0" y1="'+y+'" x2="1000" y2="'+y+'"/><text x="10" y="'+(y-8)+'">'+(lat<0?-lat+'°S':lat>0?lat+'°N':'赤道 0°')+'</text>';}
  $('rover-graticule').innerHTML=grid;
  document.querySelectorAll('.rover-selector').forEach(b=>b.onclick=()=>{++navigation;selectRover(b.dataset.id);if(location.hash.startsWith('#rovers/'))scope.router.replace({hash:'#rovers/'+b.dataset.id});});
  document.querySelectorAll('.rover-pin').forEach(b=>b.onclick=()=>navigateRover(b.dataset.id));
  function paintImage(){
    const w=viewport.clientWidth,h=viewport.clientHeight;
    const fit=Math.min(w/(routeImage.naturalWidth||1),h/(routeImage.naturalHeight||1));
    const maxX=Math.max(0,((routeImage.naturalWidth||w)*fit*scale-w)/2);
    const maxY=Math.max(0,((routeImage.naturalHeight||h)*fit*scale-h)/2);
    panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));
    routeImage.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';
    markers.querySelectorAll('button').forEach(button=>{
      const point=selected.waypoints[Number(button.dataset.place)],p=detailMap?point.detail:point;
      const x=w/2+panX+(p.x-.5)*routeImage.naturalWidth*fit*scale,y=h/2+panY+(p.y-.5)*routeImage.naturalHeight*fit*scale;
      button.style.left=x+'px';button.style.top=y+'px';
      button.style.setProperty('--label-x',(p.dx||0)+'px');button.style.setProperty('--label-y',(p.dy||0)+'px');
      button.style.setProperty('--leader-length',Math.hypot(p.dx||0,p.dy||0)+'px');button.style.setProperty('--leader-angle',Math.atan2(p.dy||0,p.dx||0)+'rad');
    });
    $('route-zoom-value').value=Math.round(scale*100)+'%';
    $('route-zoom-out').disabled=scale<=1;$('route-zoom-in').disabled=scale>=6;
    viewport.classList.toggle('is-zoomed',scale>1);
  }
  function zoom(value,anchor){
    stopMotion();pendingFocus=false;
    const next=Math.max(1,Math.min(6,value));
    if(anchor&&next!==scale){
      panX=anchor.x-(anchor.x-panX)*next/scale;
      panY=anchor.y-(anchor.y-panY)*next/scale;
    }
    scale=next;
    if(scale===1){panX=0;panY=0;activeWaypoint=-1;renderMarkers();}
    paintImage();
  }
  function selectRover(id){
    const rover=data.find(r=>r.id===id);if(!rover)return;stopMotion();selected=rover;activeWaypoint=-1;detailMap=false;pendingFocus=false;
    $('rover-panel').style.setProperty('--rover-color',rover.color);
    document.querySelectorAll('.rover-selector,.rover-pin').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
    const values={'rover-name':rover.name,'rover-en':rover.en,'rover-agency':rover.agency,'rover-site':rover.site,'rover-landing':rover.landing,'rover-coordinate':Math.abs(rover.lat).toFixed(2)+'°'+(rover.lat>=0?'N':'S')+' · '+Math.abs(rover.lon).toFixed(2)+'°'+(rover.lon>=0?'E':'W'),'rover-coverage':rover.coverage,'rover-route-title':rover.routeTitle,'rover-route-note':rover.routeNote,'rover-credit':rover.credit};
    for(const [key,value] of Object.entries(values))$(key).textContent=value;
    $('rover-map-source').href=rover.mapSource;
    $('rover-concept-title').textContent=rover.name+' · 概念图';
    const photo=rover.photo;
    if(hasSurfacePhoto&&photo){
    $('rover-surface-title').textContent=photo.title;
    $('rover-surface-image').alt=rover.name+' · '+photo.title;
    $('rover-surface-image').src=assetUrl('images/mars/rovers/'+photo.file);
    $('rover-surface-note').textContent=photo.note;
    $('rover-surface-source').textContent=photo.credit+' · 图片来源 ↗';
    $('rover-surface-source').href=photo.source;
    $('rover-surface-expand').setAttribute('aria-label','放大'+rover.name+'的火星实拍照片');
    }
    if(hasSurfacePhoto)$('rover-surface-expand').closest('figure').hidden=!photo;
    $('rover-concept-image').alt=rover.name+'：'+rover.concept.note;
    $('rover-concept-image').src=assetUrl('images/mars/rovers/'+rover.concept.file);
    $('rover-concept-note').textContent=rover.concept.note;
    $('rover-concept-source').textContent=rover.concept.credit+' · 图片来源 ↗';
    $('rover-concept-source').href=rover.concept.source;
    $('rover-concept-expand').setAttribute('aria-label','放大'+rover.name+'概念图');
    $('rover-notes-tab').textContent=rover.notesTitle;
    $('rover-notes-content').textContent=rover.notesContent;
    $('rover-waypoints').innerHTML=rover.waypoints.map((p,i)=>'<li><button type="button" aria-pressed="false" aria-controls="route-viewport"><b>'+number(i)+'</b>'+esc(p.name)+'</button></li>').join('');
    $('rover-waypoints').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>focusPlace(i));
    $('rover-findings').innerHTML=rover.findings.map((f,i)=>'<article class="rover-finding"><h5><span>0'+(i+1)+'</span>'+esc(f[0])+'</h5><p>'+esc(f[1])+'</p></article>').join('');
    $('rover-science-links').innerHTML=rover.sources.map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+' ↗</a>').join('');
    $('rover-latest-map').hidden=!rover.latest;if(rover.latest)$('rover-latest-map').href=rover.latest;else $('rover-latest-map').removeAttribute('href');
    document.querySelectorAll('.rover-overview,.rover-detail,.rover-footnote').forEach(element=>{
      element.classList.remove('rover-content-enter');
      scope.requestAnimationFrame(()=>element.classList.add('rover-content-enter'));
    });
    scale=1;panX=panY=0;drag=null;viewport.classList.remove('is-dragging');
    $('route-loading').hidden=false;$('route-loading').textContent='正在载入路线图…';viewport.setAttribute('aria-busy','true');
    routeImage.alt=rover.name+'：'+rover.routeTitle+'，'+rover.coverage;
    loadRoute();centerSelected();
  }
  routeImage.onload=()=>{$('route-loading').hidden=true;viewport.setAttribute('aria-busy','false');paintImage();if(pendingFocus)focusPlace(activeWaypoint);};
  routeImage.onerror=()=>{$('route-loading').hidden=false;$('route-loading').textContent='路线图暂时无法载入，请使用下方“原始地图”链接查看。';viewport.setAttribute('aria-busy','false');};
  function resetRoute(){zoom(1);if(detailMap){detailMap=false;loadRoute();}}
  $('route-zoom-in').onclick=()=>zoom(scale+.5);$('route-zoom-out').onclick=()=>zoom(scale-.5);$('route-fit').onclick=resetRoute;
  scope.listen(viewport, 'wheel',e=>{
    if(!routeImage.naturalWidth)return;
    e.preventDefault();
    const rect=viewport.getBoundingClientRect();
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?rect.height:1);
    zoom(scale*Math.exp(-delta*.0015),{x:e.clientX-rect.left-rect.width/2,y:e.clientY-rect.top-rect.height/2});
  },{passive:false});
  scope.listen(viewport, 'pointerdown',e=>{if(e.target.closest('button')||scale<=1||e.button!==0)return;stopMotion();drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX,panY};viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');e.preventDefault();});
  scope.listen(viewport, 'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;panX=drag.panX+e.clientX-drag.x;panY=drag.panY+e.clientY-drag.y;paintImage();});
  function stopDrag(){drag=null;viewport.classList.remove('is-dragging');}
  scope.listen(viewport, 'pointerup',stopDrag);scope.listen(viewport, 'pointercancel',stopDrag);scope.listen(viewport, 'lostpointercapture',stopDrag);
  scope.listen(viewport, 'keydown',e=>{
    if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale+.5);}
    else if(e.key==='-'){e.preventDefault();zoom(scale-.5);}
    else if(e.key==='0'){e.preventDefault();resetRoute();}
    else if(scale>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();stopMotion();panX+=e.key==='ArrowLeft'?35:e.key==='ArrowRight'?-35:0;panY+=e.key==='ArrowUp'?35:e.key==='ArrowDown'?-35:0;paintImage();}
  });
  new scope.ResizeObserver(paintImage).observe(viewport);
  $('route-expand').onclick=()=>{
    const dialog=$('image-dialog'),img=$('image-dialog-image'),caption=$('image-dialog-caption');
    img.src=routeImage.src;img.alt=routeImage.alt;
    caption.replaceChildren();
    const title=document.createElement('strong');title.className='dialog-title';title.textContent=selected.name+' · '+(selected.overviewMap&&!detailMap?'第 1—1386 火星日总览':selected.coverage);
    const note=document.createElement('span');note.className='dialog-subtitle';note.textContent=$('rover-route-note').textContent+' 来源：'+$('rover-credit').textContent;
    caption.append(title,note);dialog.showModal();dialog.classList.add('is-controls-visible');
  };
  selectRover(data[0].id);
  if(hasSurfacePhoto)$('rover-surface-expand').onclick=()=>{
    const dialog=$('image-dialog'),img=$('image-dialog-image');
    img.src=$('rover-surface-image').src;img.alt=$('rover-surface-image').alt;
    $('image-dialog-caption').textContent=selected.name+' · '+selected.photo.note+' 来源：'+selected.photo.credit;
    dialog.showModal();dialog.classList.add('is-controls-visible');
  };
  $('rover-concept-expand').onclick=()=>{
    const dialog=$('image-dialog'),img=$('image-dialog-image');
    img.src=$('rover-concept-image').src;img.alt=$('rover-concept-image').alt;
    $('image-dialog-caption').textContent=selected.name+' · '+selected.concept.note+' 来源：'+selected.concept.credit;
    dialog.showModal();dialog.classList.add('is-controls-visible');
  };
  const worldDialog=document.createElement('dialog');worldDialog.className='world-map-dialog';worldDialog.id='world-map-dialog';worldDialog.setAttribute('aria-label','火星全球着陆区地图');document.body.append(worldDialog);
  let worldOpener=null;
  function openWorld(){
    worldOpener=document.activeElement;
    worldDialog.innerHTML='<header><div><strong>火星全球地图 · 着陆区</strong><p>点击圆点或名称，前往对应巡视器介绍</p></div><button type="button" class="rover-button" aria-label="关闭全球地图">关闭 ×</button></header><div class="world-dialog-scroll"></div>';
    const map=$('rover-world-map').cloneNode(true);map.removeAttribute('id');map.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    map.querySelectorAll('.rover-pin').forEach(b=>b.onclick=()=>{worldDialog.close();navigateRover(b.dataset.id);});
    worldDialog.querySelector('.world-dialog-scroll').append(map);
    worldDialog.querySelector('header button').onclick=()=>worldDialog.close();worldDialog.showModal();
    const frame=worldDialog.querySelector('.world-dialog-scroll');frame.scrollLeft=(selected.lon+180)/360*map.clientWidth-frame.clientWidth/2;
  }
  scope.listen(worldDialog, 'click',e=>{if(e.target===worldDialog)worldDialog.close();});
  scope.listen(worldDialog, 'close',()=>{worldDialog.replaceChildren();if(worldOpener&&worldOpener.isConnected)worldOpener.focus({preventScroll:true});});
  const worldButton=document.createElement('button');worldButton.type='button';worldButton.id='world-expand';worldButton.className='rover-button';worldButton.textContent='放大地图 ↗';worldButton.onclick=openWorld;
  document.querySelector('.rover-world .map-topline small').replaceWith(worldButton);
  scope.listen($('rover-world-map'), 'click',e=>{if(!e.target.closest('.rover-pin'))openWorld();});
  const worldFrame=document.querySelector('.world-map-scroll');worldFrame.setAttribute('aria-label','火星全球着陆区地图，按回车放大，点击标记查看巡视器介绍');
  scope.listen(worldFrame, 'keydown',e=>{if(e.target===worldFrame&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openWorld();}});
  const summary=document.querySelector('.rover-summary');summary.id='rover-introduction';summary.tabIndex=-1;
  let navigation=0;
  function navigateRover(id,updateHash=true){
    if(!data.some(r=>r.id===id))return;
    const token=++navigation;selectRover(id);showTab(2,false);
    if(updateHash)scope.router.push({hash:'#rovers/'+id});
    scope.setTimeout(()=>{if(token!==navigation)return;summary.focus({preventScroll:true});summary.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});},reducedMotion.matches?0:340);
  }
  function readRoverHash(){const id=location.hash.slice('#rovers/'.length);if(location.hash.startsWith('#rovers/')&&data.some(r=>r.id===id))navigateRover(id,false);else if(location.hash.startsWith('#rovers'))showTab(2,false);}
  scope.listen(window, 'hashchange',readRoverHash);
  readRoverHash();
  if(location.hash.startsWith('#pioneer'))showTab(0,false);
})();
}
