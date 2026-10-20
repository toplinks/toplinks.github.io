'use strict';
(()=>{
 const modes={
  web:{label:'Web',engines:{
   google:{name:'Google',action:'https://www.google.com/search',param:'q'},
   yahoo:{name:'Yahoo',action:'https://search.yahoo.com/search',param:'p'},
   bing:{name:'Bing',action:'https://www.bing.com/search',param:'q'},
   baidu:{name:'Baidu',action:'https://www.baidu.com/s',param:'wd'},
   duckduckgo:{name:'DuckDuckGo',action:'https://duckduckgo.com/',param:'q'}
  }},
  images:{label:'Images',engines:{
   unsplash:{name:'Unsplash',action:'https://unsplash.com/s/photos/',path:true},
   pexels:{name:'Pexels',action:'https://www.pexels.com/search/',path:true,suffix:'/',icon:'pexels.svg'},
   pixabay:{name:'Pixabay',action:'https://pixabay.com/images/search/',path:true,suffix:'/',icon:'pixabay.svg'},
   flickr:{name:'Flickr',action:'https://www.flickr.com/search/',param:'text'},
   wikimedia:{name:'Wikimedia',action:'https://commons.wikimedia.org/w/index.php',param:'search',extra:{title:'Special:MediaSearch',type:'image'}}
  }},
  maps:{label:'Maps',engines:{
   google:{name:'Google Maps',action:'https://www.google.com/maps/search/',param:'query',extra:{api:'1'}},
   apple:{name:'Apple Maps',action:'https://maps.apple.com/',param:'q'},
   openstreetmap:{name:'OpenStreetMap',action:'https://www.openstreetmap.org/search',param:'query'},
   bing:{name:'Bing Maps',action:'https://www.bing.com/maps',param:'q'},
   mapquest:{name:'MapQuest',action:'https://www.mapquest.com/search/results',param:'query'}
  }},
  videos:{label:'Videos',engines:{
   youtube:{name:'YouTube',action:'https://www.youtube.com/results',param:'search_query'},
   dailymotion:{name:'Dailymotion',action:'https://www.dailymotion.com/search/',path:true,suffix:'/videos'},
   vimeo:{name:'Vimeo',action:'https://vimeo.com/search',param:'q'},
   pexels:{name:'Pexels',action:'https://www.pexels.com/search/videos/',path:true,suffix:'/',icon:'pexels.svg'},
   pixabay:{name:'Pixabay',action:'https://pixabay.com/videos/search/',path:true,suffix:'/',icon:'pixabay.svg'}
  }}
 };
 const section=document.querySelector('.search-section'),form=document.querySelector('#web-search'),query=document.querySelector('#web-query'),options=document.querySelector('.engine-options');
 let mode='web';const choices={web:'google',images:'unsplash',maps:'google',videos:'youtube'};
 function configure(){
  const selected=choices[mode],engine=modes[mode].engines[selected];
  form.action=engine.action;query.name=engine.param||'q';
  form.querySelectorAll('[data-mode-param]').forEach(input=>input.remove());
  for(const [name,value] of Object.entries(engine.extra||{})){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;input.dataset.modeParam='';form.append(input);}
  query.placeholder=mode==='maps'?`Find a place on ${engine.name}…`:`Search ${engine.name}${mode==='web'?'':' '+modes[mode].label.toLowerCase()}…`;
  const image=document.querySelector('#engine-icon');image.hidden=false;image.src=`icons/${engine.icon||selected+'.ico'}`;image.alt=engine.name;document.querySelector('.engine-mark').dataset.initial=engine.name[0];
  document.querySelector('label[for="web-query"]').textContent=`Search ${modes[mode].label.toLowerCase()}`;
 }
 function render(){
  section.setAttribute('aria-label',`Search ${modes[mode].label.toLowerCase()}`);
  document.querySelector('#search-panel').setAttribute('aria-labelledby',`mode-${mode}`);
  document.querySelectorAll('[data-search-mode]').forEach(button=>{const active=button.dataset.searchMode===mode;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
  options.innerHTML='<legend class="sr-only">Choose a search provider</legend>'+Object.entries(modes[mode].engines).map(([key,engine])=>`<label><input type="radio" name="engine" value="${key}"${choices[mode]===key?' checked':''}><img class="provider-icon" src="icons/${engine.icon||key+'.ico'}" alt="" width="16" height="16">${engine.name}</label>`).join('');
  options.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{image.hidden=true;},{once:true}));
  configure();
 }
 options.addEventListener('change',event=>{if(!modes[mode].engines[event.target.value])return;choices[mode]=event.target.value;configure();});
 document.querySelector('#engine-icon').addEventListener('error',event=>{event.target.hidden=true;});
 form.addEventListener('submit',event=>{
  if(event.defaultPrevented)return;
  const engine=modes[mode].engines[choices[mode]];
  if(engine.path){event.preventDefault();const value=query.value.trim();if(value)window.open(engine.action+encodeURIComponent(value)+(engine.suffix||''),'_blank','noopener,noreferrer');}
 });
 const tabs=document.querySelector('.search-modes');
 tabs.addEventListener('click',event=>{const button=event.target.closest('[data-search-mode]');if(!button)return;mode=button.dataset.searchMode;render();});
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const buttons=[...tabs.querySelectorAll('button')];let index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;mode=buttons[index].dataset.searchMode;render();buttons[index].focus();});
 render();
})();

