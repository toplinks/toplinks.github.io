// Apply the saved theme before the page paints. Both themes are entirely static.
(()=>{
  let theme='light';
  try{const saved=localStorage.getItem('toplinks.design2.theme.v1');if(saved==='dark'||saved==='light')theme=saved;}catch{}
  function apply(value){
    document.documentElement.dataset.theme=value;
    document.querySelector('meta[name="theme-color"]').content=value==='dark'?'#000000':'#f7f8f2';
    const button=document.querySelector('#theme-toggle');
    if(button){button.innerHTML='<span class="topbar-icon '+(value==='dark'?'icon-sun':'icon-moon')+'" aria-hidden="true"></span>';button.setAttribute('aria-label',value==='dark'?'Switch to light theme':'Switch to black theme');button.setAttribute('title',value==='dark'?'Switch to light theme':'Switch to black theme');button.setAttribute('aria-pressed',String(value==='dark'));}
  }
  apply(theme);
  document.addEventListener('DOMContentLoaded',()=>{
    apply(theme);
    document.querySelector('#theme-toggle').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';apply(theme);try{localStorage.setItem('toplinks.design2.theme.v1',theme);}catch{}});
  });
})();

