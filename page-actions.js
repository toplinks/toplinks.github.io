// Floating page navigation, shared by all current-site pages.
(()=>{
 const top=document.querySelector('[data-back-to-top]');
 if(!top)return;
 const update=()=>{top.hidden=window.scrollY<360;};
 window.addEventListener('scroll',update,{passive:true});
 update();
 top.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.querySelector('.header .brand')?.focus({preventScroll:true});
 });
})();
