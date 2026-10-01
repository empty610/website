
export function initPioneer(scope) {
(function(){
  'use strict';
  const buttons=[...document.querySelectorAll('.pioneer-tabs [role="tab"]')];
  if(!buttons.length)return;
  function select(index,focus){
    buttons.forEach((button,i)=>{
      const active=i===index;
      button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
      const panel=document.getElementById(button.getAttribute('aria-controls'));
      panel.hidden=!active;
      if(active){
        panel.classList.remove('pioneer-content-enter');
        scope.requestAnimationFrame(()=>panel.classList.add('pioneer-content-enter'));
      }
    });
    if(focus)buttons[index].focus();
  }
  buttons.forEach((button,index)=>{
    button.onclick=()=>select(index,false);
    button.onkeydown=event=>{
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%buttons.length;
      else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=buttons.length-1;
      else return;
      event.preventDefault();select(next,true);
    };
  });
})();
}
