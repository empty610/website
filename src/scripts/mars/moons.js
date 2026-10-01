
export function initMarsMoons(scope) {
/* NASA/JPL shape meshes, normalized by volume to JPL equivalent mean radii.
   One scene unit = 3390 / 1.34 km. Orbital phases illustrate a configuration,
   not a dated ephemeris. Orbit curves use JPL mean a and e. */
scope.expose('setupMarsMoons', function({scene,camera,renderer,controls,world,sphere,stage,mount,surfaceMaterialOptions}) {
 const T=THREE,unit=1.34/3390,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const rotationButton=document.getElementById('rotation-toggle');
 const bodies={mars:{name:'火星',en:'MARS',radius:3390,mesh:sphere,color:'#c5764e',text:'平均半径 3,390 km · 拖动旋转，滚轮缩放'},
  phobos:{name:'火卫一',en:'PHOBOS',radius:11.08,a:9375,e:.015,phase:.55,i:1.1,color:'#ae8642',text:'平均半径 11.08 km · 平均轨道半径 9,375 km'},
  deimos:{name:'火卫二',en:'DEIMOS',radius:6.2,a:23457,e:0,phase:2.75,i:1.8,color:'#548c97',text:'平均半径 6.2 km · 平均轨道半径 23,457 km'}};
 const toolbar=document.createElement('div');toolbar.className='moon-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','选择三维天体');
 toolbar.innerHTML=['system','mars','phobos','deimos'].map(id=>`<button type="button" data-body="${id}" aria-pressed="${id==='system'}">${id==='system'?'全景':bodies[id].name}</button>`).join('');
 const labels=document.createElement('div');labels.className='moon-labels';
 const info=document.createElement('div');info.className='moon-info';info.setAttribute('aria-live','polite');
 const sources=document.createElement('div');sources.className='moon-sources';sources.innerHTML='<a href="https://science.nasa.gov/resource/phobos-mars-moon-3d-model/" target="_blank" rel="noopener">NASA 火卫一模型</a><a href="https://science.nasa.gov/resource/deimos-mars-moon-3d-model/" target="_blank" rel="noopener">火卫二模型</a><a href="https://ssd.jpl.nasa.gov/sats/elem/sep.html" target="_blank" rel="noopener">JPL 轨道</a>';
 const archives=document.createElement('div');archives.className='moon-archives';
 const marsContent=document.getElementById('mars-intro-content');
 marsContent.tabIndex=0;marsContent.setAttribute('role','region');marsContent.setAttribute('aria-label','火星档案正文，可滚动');
 const archiveCopy={
  phobos:{title:'Phobos profile · 火卫一档案',paragraphs:[
   '火卫一，以希腊神话中战神阿瑞斯之子“福波斯”命名，意为“恐惧”，因其表面布满撞击坑，凹凸不平且形状不太规则，常被形容为“土豆”。它的表面覆盖着厚厚的尘埃层，厚度至少有一米。同时，它也是太阳系中最暗淡的天体之一。',
   '它的平均半径约为22千米，绕火星旋转的平均轨道半径约为9378千米；平均密度约为水的两倍，表面重力约为地球的万分之八。它约7小时39分钟绕行火星一周，运行速度快于火星自转。在火星表面观察，火卫一会出现“西升东落”的奇特现象。火卫一上最大的撞击坑是斯蒂克尼陨石坑（Stickney），直径约8千米，几乎占据了火卫一的半个表面。',
   '研究数据表明，火卫一并非实心的岩石，而更像是一个由碎石和尘埃在引力下聚集的碎石堆，近期证据表明火卫一可能是约40亿年前由一次巨大天体撞击火星产生的抛射碎片聚集而成。它正因潮汐力衰减而缓慢向火星靠近，约3000万年后便会因抵达洛希极限而被摧毁，形成火星环。有理论认为，火星的卫星系统长期在“卫星”与“行星环”间循环。但无论如何，它的沟槽、撞击坑和表层物质保存着火星系统早期演化的线索，也是未来采样任务关注的目标。'],
   href:'https://science.nasa.gov/mars/moons/phobos/'},
  deimos:{title:'Deimos profile · 火卫二档案',paragraphs:[
   '火卫二，以希腊神话中战神阿瑞斯之子“德莫斯”命名，意为“畏惧”，是一个形状不规则的小天体，表面覆盖着较厚的松散表层，因此整体外观比火卫一平滑得多，被调侃为“蒙尘的土豆”。',
   '它的平均半径约6.2千米，平均轨道半径约23460千米；表面重力及其微弱，仅需要轻轻一跳便能轻松达到其5.6m/s的逃逸速度，实现从火卫二进入太空。它约30小时18分钟绕行火星一周，轨道接近圆形且几乎与火星赤道面重合。',
   '因为距离火星太远，火卫二正以十分缓慢的速度逐渐远离火星，并最终可能挣脱火星引力，飘向深空。与布满深坑的火卫二不同，火卫二表面相对光滑，主要得益于一层厚厚的风化层。火卫二内部极度疏松，密度仅为水的一点五倍。主流假说认为它的成因与火卫一类似，但最新研究认为火卫二与火卫一不太可能是“亲兄弟”，即二者不来源于同一母天体的分裂。'],
   href:'https://science.nasa.gov/resource/deimos-mars-moon-3d-model/'}
 };
 for(const [id,copy] of Object.entries(archiveCopy)){
  const card=document.createElement('section');card.className='moon-archive';card.id=id+'-archive';card.hidden=true;
  card.innerHTML=`<button class="moon-archive-title" type="button" aria-expanded="false" aria-controls="${id}-archive-content"><span>${copy.title}</span><span class="moon-archive-mark" aria-hidden="true">＋</span></button><div class="moon-archive-divider" aria-hidden="true"></div><div id="${id}-archive-content" hidden>${copy.paragraphs.map(p=>'<p>'+p+'</p>').join('')}<p><a href="${copy.href}" target="_blank" rel="noopener">资料：NASA ↗</a> · <a href="https://ssd.jpl.nasa.gov/sats/elem/sep.html" target="_blank" rel="noopener">JPL 轨道资料 ↗</a></p></div>`;
  const button=card.querySelector('button'),content=card.querySelector('#'+id+'-archive-content');
  content.tabIndex=0;content.setAttribute('role','region');content.setAttribute('aria-label',bodies[id].name+'档案正文，可滚动');
  button.onclick=()=>{const open=!card.classList.contains('is-open');card.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));content.hidden=!open;button.querySelector('.moon-archive-mark').textContent=open?'−':'＋';};
  archives.append(card);
 }
 stage.append(toolbar,labels,info,sources,archives);stage.classList.add('moons-ready');
 const arrays={5126:Float32Array,5123:Uint16Array,5125:Uint32Array};
 function attribute(a){const bytes=Uint8Array.from(atob(a.data),c=>c.charCodeAt(0));return new T.BufferAttribute(new arrays[a.type](bytes.buffer),a.size);}
 const orbitPoints=[];
 for(const id of ['phobos','deimos']) {
  const b=bodies[id],data=window.MARS_MOON_ASSETS[id],g=new T.BufferGeometry();
  for(const key of ['position','normal','uv'])g.setAttribute(key,attribute(data[key]));g.setIndex(attribute(data.index));g.center();
  const p=g.attributes.position,idx=g.index,a=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();let volume=0;
  for(let j=0;j<idx.count;j+=3){a.fromBufferAttribute(p,idx.getX(j));c.fromBufferAttribute(p,idx.getX(j+1));d.fromBufferAttribute(p,idx.getX(j+2));volume+=a.dot(c.cross(d))/6;}
  const radius=Math.cbrt(Math.abs(volume)*3/(4*Math.PI));g.scale(b.radius*unit/radius,b.radius*unit/radius,b.radius*unit/radius);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial(surfaceMaterialOptions||{roughness:.88,metalness:0,color:0xffffff,emissive:0xffffff,emissiveIntensity:.2});
  new T.TextureLoader().load(data.texture,map=>{map.colorSpace=T.SRGBColorSpace;map.flipY=false;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());mat.map=map;mat.emissiveMap=map;mat.needsUpdate=true;b.textureLoaded=true;},undefined,()=>{b.textureLoaded=false;const message=info.querySelector('p');if(message)message.textContent='卫星贴图未能载入，请刷新页面。';});
  b.mesh=new T.Mesh(g,mat);b.bound=g.boundingSphere.radius;
  const plane=new T.Group();plane.rotation.x=T.MathUtils.degToRad(b.i);world.add(plane);
  const at=angle=>new T.Vector3(b.a*unit*(Math.cos(angle)-b.e),0,b.a*unit*Math.sqrt(1-b.e*b.e)*Math.sin(angle));
  b.mesh.position.copy(at(b.phase));b.mesh.rotation.y=-b.phase;plane.add(b.mesh);
  const points=Array.from({length:361},(_,i)=>at(i*Math.PI/180));
  const orbit=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:b.color,transparent:true,opacity:.36}));plane.add(orbit);b.orbit=orbit;
  world.updateMatrixWorld(true);points.forEach(p=>orbitPoints.push(plane.localToWorld(p.clone())));
  const label=document.createElement('button');label.type='button';label.className='moon-label';label.style.setProperty('--moon-color',b.color);label.textContent=b.name+' · '+b.en;label.setAttribute('aria-label','放大查看'+b.name);label.onclick=()=>focus(id);labels.append(label);b.label=label;
 }
 bodies.mars.bound=1.38;
 let selected='system',flight=null,savedRotate=controls.autoRotate;
 const direction=new T.Vector3(0,.48,1).normalize();
 function center(id){return id==='system'?new T.Vector3():bodies[id].mesh.getWorldPosition(new T.Vector3());}
 function distance(id) {
  const v=T.MathUtils.degToRad(camera.fov/2),h=Math.atan(Math.tan(v)*camera.aspect);
  if(id!=='system')return bodies[id].bound/Math.sin(Math.min(v,h))*1.35;
  const right=new T.Vector3(1,0,0),up=new T.Vector3().crossVectors(direction,right).normalize();
  return Math.max(...orbitPoints.map(p=>p.dot(direction)+Math.max(Math.abs(p.dot(right))/Math.tan(h),Math.abs(p.dot(up))/Math.tan(v))))*1.19;
 }
 function limits(id){const r=id==='system'?1.34:bodies[id].bound;controls.minDistance=r*1.65;controls.maxDistance=id==='system'?100:r*15;camera.near=id==='system'?.01:r/1000;camera.far=200;camera.updateProjectionMatrix();}
 function updateInfo(id){info.innerHTML=id==='system'?'<strong>火星与它的两颗卫星</strong><p>天体大小与轨道距离采用同一真实比例。<br>点击卫星标签靠近查看；标签圆点仅为定位标记。轨道相位为示意。</p>':`<strong>${bodies[id].name} <small>${bodies[id].en}</small></strong><p>${bodies[id].text}<br>镜头近距观察 · 天体尺寸保持真实比例</p>`;}
 function focus(id,instant=false) {
 if(!bodies[id]&&id!=='system')return;
  if(!flight)savedRotate=controls.autoRotate;
  controls.autoRotate=false;controls.enabled=false;controls.enableDamping=false;rotationButton.disabled=true;
  const fromId=selected,target=center(id),fromTarget=controls.target.clone(),fromPos=camera.position.clone();
  selected=id;stage.classList.toggle('moon-closeup',id==='phobos'||id==='deimos');
  for(const moon of ['phobos','deimos'])document.getElementById(moon+'-archive').hidden=moon!==id;
  for(const moon of ['phobos','deimos'])bodies[moon].orbit.visible=id==='system';
  toolbar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.body===id)));updateInfo(id);
  controls.minDistance=0;controls.maxDistance=1000;camera.near=.000001;camera.updateProjectionMatrix();
  const fromDistance=fromPos.distanceTo(fromTarget),toDistance=distance(id);
  // Close-up bodies use radically different viewing distances. Pull away from
  // the current body before transferring the target so no direct path crosses
  // Mars or either moon on the way to the next close-up.
  const retreat=fromId!=='system'&&id!=='system'&&fromId!==id;
  const returnToSystem=(fromId==='phobos'||fromId==='deimos')&&id==='system';
  const fromDirection=fromPos.clone().sub(fromTarget).normalize();
  const escapeDirection=fromTarget.clone().normalize();
  flight={start:performance.now(),duration:instant||reduced.matches?0:returnToSystem?2200:1550,target,fromTarget,fromPos,fromDistance,toDistance,fromDirection,retreat,returnToSystem,escapeDirection,escapeDistance:Math.max(fromDistance*1.35,toDistance*1.15,bodies.mars.bound*3.6),turnRotation:new T.Quaternion().setFromUnitVectors(fromDirection,escapeDirection),settleRotation:new T.Quaternion().setFromUnitVectors(escapeDirection,direction)};
  if(!flight.duration)beforeFrame(flight.start);
 }
 toolbar.querySelectorAll('button').forEach(b=>b.onclick=()=>focus(b.dataset.body));
 function beforeFrame(time) {
  if(!flight)return;
  const f=flight,t=f.duration?Math.min(1,(time-f.start)/f.duration):1,ease=x=>x*x*(3-2*x),clamp=x=>Math.max(0,Math.min(1,x));
  if(f.returnToSystem){
   // Overlap the turn, retreat, target movement and final framing. The
   // camera clears Mars before the target crosses back through its centre.
   const turn=ease(clamp(t/.48));
   const pull=ease(clamp((t-.10)/.58));
   const travel=ease(clamp((t-.48)/.46));
   const settle=ease(clamp((t-.68)/.32));
   const dir=f.fromDirection.clone().applyQuaternion(new T.Quaternion().identity().slerp(f.turnRotation,turn));
   if(t>.68)dir.copy(f.escapeDirection).applyQuaternion(new T.Quaternion().identity().slerp(f.settleRotation,settle));
   controls.target.copy(f.fromTarget).lerp(f.target,travel);
   const dist=(f.fromDistance+(f.escapeDistance-f.fromDistance)*pull)*(1-settle)+f.toDistance*settle;
   camera.position.copy(controls.target).addScaledVector(dir,dist);
  } else {
  const travel=f.retreat?ease(clamp((t-.18)/.54)):ease(Math.min(1,t/.72));
  const zoom=f.retreat?ease(clamp((t-.54)/.46)):ease(Math.max(0,(t-.28)/.72));
  controls.target.lerpVectors(f.fromTarget,f.target,travel);
  const dir=f.fromDirection.clone().lerp(direction,ease(t)).normalize();
  const dist=f.retreat
   ? (t<.36?f.fromDistance+(f.escapeDistance-f.fromDistance)*ease(t/.36):Math.exp(Math.log(f.escapeDistance)*(1-zoom)+Math.log(f.toDistance)*zoom))
   : Math.exp(Math.log(f.fromDistance)*(1-zoom)+Math.log(f.toDistance)*zoom);
  camera.position.copy(controls.target).addScaledVector(dir,dist);
  }
  if(t===1){flight=null;limits(selected);controls.enabled=true;controls.enableDamping=true;controls.autoRotate=savedRotate;rotationButton.disabled=false;}
 }
 const point=new T.Vector3(),ray=new T.Raycaster();
 function overlayRect(element) {
  if(!element||element.hidden||getComputedStyle(element).display==='none')return null;
  const rect=element.getBoundingClientRect(),base=mount.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  return {left:rect.left-base.left,right:rect.right-base.left,top:rect.top-base.top,bottom:rect.bottom-base.top};
 }
 function intersects(one,two) {
  return one.left<two.right&&one.right>two.left&&one.top<two.bottom&&one.bottom>two.top;
 }
 function afterFrame() {
  const w=mount.clientWidth,h=mount.clientHeight;
  const obstacles=[info,toolbar,stage.querySelector('.planet-intro'),...archives.querySelectorAll('.moon-archive')].map(overlayRect).filter(Boolean);
  const placed=[];
  for(const id of ['phobos','deimos']) {
   const b=bodies[id],pos=b.mesh.getWorldPosition(new T.Vector3());point.copy(pos).project(camera);
   ray.set(camera.position,pos.clone().sub(camera.position).normalize());const hit=ray.intersectObject(sphere)[0],occluded=hit&&hit.distance<camera.position.distanceTo(pos);
   const x=(point.x+1)*w/2,y=(1-point.y)*h/2;
   const unavailable=selected!=='system'||occluded||point.z< -1||point.z>1||x<0||x>w||y<80||y>h-80;
   if(unavailable){b.label.hidden=true;continue;}
   b.label.hidden=false;
   const half=(b.label.offsetWidth||120)/2,height=b.label.offsetHeight||34;
   const clampX=value=>Math.max(half+8,Math.min(w-half-8,value));
   const clampY=value=>Math.max(height+8,Math.min(h-8,value));
   const baseY=y-14;
   const candidates=[[x,baseY],[x+150,baseY],[x-150,baseY],[x,baseY+70],[x+150,baseY+70],[x-150,baseY+70],[w-half-8,baseY],[half+8,baseY]];
   let choice=null;
   for(const [candidateX,candidateY] of candidates){
    const left=clampX(candidateX),top=clampY(candidateY),rect={left:left-half,right:left+half,top:top-height,bottom:top};
    if(![...obstacles,...placed].some(blocker=>intersects(rect,blocker))){choice={left,top,rect};break;}
   }
   if(!choice){b.label.hidden=true;continue;}
   placed.push(choice.rect);
   b.label.style.left=choice.left+'px';b.label.style.top=choice.top+'px';
   b.label.style.setProperty('--anchor-x',(half+x-choice.left)+'px');
   b.label.classList.toggle('moon-label-floating',Math.abs(choice.left-x)>32||Math.abs(choice.top-baseY)>32);
  }
 }
 let down=null;
 scope.listen(renderer.domElement, 'pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 scope.listen(renderer.domElement, 'pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||flight)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(Object.values(bodies).map(b=>b.mesh))[0];if(hit){const id=Object.keys(bodies).find(id=>bodies[id].mesh===hit.object);if(id!==selected)focus(id);}});
 let resizeTimer;
 new scope.ResizeObserver(()=>{scope.clearTimeout(resizeTimer);resizeTimer=scope.setTimeout(()=>{if(mount.clientWidth&&mount.clientHeight)focus(selected,true);},80);}).observe(mount);
 scope.expose('MarsMoons', {bodies,focus,camera,controls,get selected(){return selected;},get transitioning(){return !!flight;},unit});
 focus('system',true);
 return {beforeFrame,afterFrame};
});
}
