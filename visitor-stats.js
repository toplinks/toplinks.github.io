// Shared counters run on the published domain, never on local preview URLs.
(()=>{
 const config=window.TOPLINKS_VISITOR_COUNTER;
 const stats=document.querySelector('.visitor-stats');
 if(!stats||!config)return;
 const message=stats.querySelector('.visitor-stats-note');
 if(location.hostname!==config.domain){message.textContent='Live counts appear on the published site.';return;}
 message.textContent='Homepage views since tracking began · Online visitors are estimated.';
 const loadScript=(url,onError)=>{const script=document.createElement('script');script.src=url;script.async=true;script.onerror=onError;document.head.appendChild(script);};
 loadScript('https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js',()=>{document.querySelector('#busuanzi_value_site_pv').textContent='Unavailable';});
 // Disable the provider's optional secondary data-collection script.
 window._wau_opt={fd:true,target:'_blank'};
 window._wau=window._wau||[];
 window._wau.push(['small',config.onlineWidgetId,'toplinks']);
 const slot=document.querySelector('.online-counter-slot');
 const marker=document.createElement('script');marker.id='_wautoplinks';slot.appendChild(marker);
 const observer=new MutationObserver(()=>{if(slot.querySelector('span')){stats.querySelector('.online-placeholder').hidden=true;observer.disconnect();}});
 observer.observe(slot,{childList:true});
 loadScript('https://waust.at/s.js',()=>{stats.querySelector('.online-placeholder').textContent='Unavailable';observer.disconnect();});
 setTimeout(()=>{const total=document.querySelector('#busuanzi_value_site_pv');if(total.textContent==='—')total.textContent='Unavailable';const online=stats.querySelector('.online-placeholder');if(!online.hidden&&online.textContent==='—')online.textContent='Unavailable';},12000);
})();
