'use strict';
(async()=>{
 const catalog=(await window.toplinksCatalogReady).data,select=document.querySelector('#suggest-category'),form=document.querySelector('#suggest-form'),status=document.querySelector('#suggest-status');
 for(const category of [...catalog.categories].sort((a,b)=>a.name.localeCompare(b.name))){const option=document.createElement('option');option.value=category.name;option.textContent=category.name;select.appendChild(option);}
 form.addEventListener('submit',event=>{event.preventDefault();try{
  const value=CatalogCore.suggestion({name:document.querySelector('#suggest-name').value,url:document.querySelector('#suggest-url').value,category:select.value,description:document.querySelector('#suggest-description').value});
  if(catalog.websites.some(site=>CatalogCore.idFor(site.url)===CatalogCore.idFor(value.url)))throw Error('This website’s domain is already in the directory. Please contact the maintainer for a correction or a specific subpage suggestion.');
  const repo=window.TOPLINKS_REPOSITORY,body='Please review this website suggestion.\n\n```json\n'+JSON.stringify(value,null,2).replace(/`/g,'\\u0060')+'\n```\n\nSubmitted through the Top Links suggestion form.';
  const destination=new URL(`https://github.com/${repo.owner}/${repo.repo}/issues/new`);destination.searchParams.set('title','[Website suggestion] '+value.name);destination.searchParams.set('body',body);destination.searchParams.set('labels','website-submission');
  status.textContent='Opening GitHub. Review the issue and submit it there to send your suggestion.';window.open(destination.href,'_blank','noopener,noreferrer');
 }catch(error){status.textContent=error.message;}});
})();
