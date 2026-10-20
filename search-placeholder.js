// Animate hints only while the search is empty, unfocused, and visible.
(()=>{
 const input=document.querySelector('#web-query'),engine=document.querySelector('#engine-icon'),panel=document.querySelector('#search-panel');
 if(!input||!engine||!panel)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let timer,index=0,length=0,deleting=false,phrases=[],base='';
 const pause=()=>{clearTimeout(timer);input.placeholder=base;};
 function tick(){
  clearTimeout(timer);
  if(reduced.matches||document.hidden||document.activeElement===input||input.value){pause();return;}
  const phrase=phrases[index];
  length+=deleting?-1:1;input.placeholder=phrase.slice(0,Math.max(0,length));
  let delay=deleting?35:62;
  if(!deleting&&length>=phrase.length){deleting=true;delay=2200;}
  else if(deleting&&length<=0){deleting=false;index=(index+1)%phrases.length;delay=300;}
  timer=setTimeout(tick,delay);
 }
 function reset(){
  clearTimeout(timer);
  const mode=panel.getAttribute('aria-labelledby')?.replace('mode-','')||'web';
  base=mode==='maps'?`Find a place on ${engine.alt}…`:`Search ${engine.alt}${mode==='web'?'':' '+mode}…`;
  const hints={web:['Find your next useful idea…','What would you like to discover?'],images:['Find inspiration for your next project…','Explore photos, colors, and ideas…'],maps:['Find a place you want to explore…','Where would you like to go?'],videos:['Find a tutorial or a new story…','What would you like to watch?']};
  phrases=[base,...hints[mode]];index=0;length=base.length;deleting=false;input.placeholder=base;
  if(!reduced.matches&&!document.hidden&&document.activeElement!==input&&!input.value)timer=setTimeout(tick,2200);
 }
 new MutationObserver(reset).observe(engine,{attributes:true,attributeFilter:['alt']});
 input.addEventListener('focus',pause);input.addEventListener('blur',reset);input.addEventListener('input',()=>{if(input.value)pause();else reset();});
 document.addEventListener('visibilitychange',()=>document.hidden?pause():reset());reduced.addEventListener('change',reset);
 window.addEventListener('pagehide',()=>clearTimeout(timer));reset();
})();
