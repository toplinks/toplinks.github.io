(()=>{
 const button=document.querySelector('#homepage-login');if(!button)return;
 const user='<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',studio='<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>';
 const update=()=>{let signedIn=false;try{const marker=Number(localStorage.getItem('toplinks.design2.studioActive.v1')||0);signedIn=Boolean(sessionStorage.getItem('toplinks.design2.githubSession.v1'))||(marker>0&&Date.now()-marker<86400000);}catch{}button.hidden=false;button.querySelector('span').textContent=signedIn?'Studio':'Login';button.querySelector('svg').innerHTML=signedIn?studio:user;button.setAttribute('aria-label',signedIn?'Open Studio':'Sign in to Studio');};
 update();window.addEventListener('storage',update);window.addEventListener('pageshow',update);window.addEventListener('focus',update);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
})();
