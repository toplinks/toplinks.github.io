// Keep the tagline aligned with the complete centered logo mark and wordmark.
(()=>{
 const group=document.querySelector('.search-section>.header-brand-group');if(!group)return;
 const brand=group.querySelector('.brand'),tagline=group.querySelector('.header-tagline');
 const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
 function fit(){
  const width=brand.getBoundingClientRect().width,style=getComputedStyle(tagline);
  context.font=style.font;
  const natural=context.measureText(tagline.textContent).width;
  const gaps=Math.max(1,[...tagline.textContent].length-1);
  tagline.style.width=width+'px';
  tagline.style.letterSpacing=((width-natural)/gaps)+'px';
 }
 new ResizeObserver(fit).observe(brand);fit();
 document.fonts?.ready.then(fit);
})();
