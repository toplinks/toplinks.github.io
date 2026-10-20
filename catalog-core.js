(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CatalogCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const icons=['layers','palette','graduation-cap','code-xml','flag','newspaper','play','shopping-bag','wrench','sparkles','pen-line','microscope','book-open','languages','orbit','briefcase','laptop','chart-no-axes-combined','plane','map','camera','clapperboard','music','gamepad-2','trophy','cloud','shield-check','heart-pulse','utensils','landmark','globe','download'];
 function text(value,label,max=200){if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error(`${label} is required and must be ${max} characters or fewer.`);return value.trim();}
 function url(value){const raw=text(value,'Website URL',2048),parsed=new URL(raw);if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw Error('Use an HTTPS website URL without login details.');return parsed.href;}
 const idFor=value=>new URL(url(value)).hostname.replace(/^www\./,'');
 const clone=value=>JSON.parse(JSON.stringify(value));
 function validate(data){
  if(!data||data.schemaVersion!==1||!Array.isArray(data.categories)||!Array.isArray(data.websites)||!Array.isArray(data.shortcuts))throw Error('This is not a Top Links catalog (schemaVersion 1).');
  if(data.categories.length<1||data.categories.length>300||data.websites.length>15000||data.shortcuts.length>100)throw Error('Catalog size is outside the supported limits.');
  const names=new Set(),categoryIds=new Set(),siteIds=new Set(),urls=new Set(),shortcuts=new Set();
  for(const c of data.categories){text(c.id,'Category ID',100);text(c.name,'Category name',70);if(['all websites','my favorites'].includes(c.name.trim().toLowerCase()))throw Error('This category name is reserved for directory navigation.');if(!/^[a-z0-9-]+$/.test(c.id)||!icons.includes(c.icon))throw Error('Invalid category ID or icon.');if(names.has(c.name.toLowerCase())||categoryIds.has(c.id))throw Error('Category names and IDs must be unique.');names.add(c.name.toLowerCase());categoryIds.add(c.id);}
  for(const site of data.websites){text(site.id,'Website ID',250);if(!/^[a-zA-Z0-9._:-]+$/.test(site.id))throw Error('Invalid website ID.');text(site.name,'Website name',120);const href=url(site.url);text(site.description,'Website description',650);if(!data.categories.some(c=>c.name===site.category))throw Error(`Unknown category for ${site.name}.`);if(siteIds.has(site.id)||urls.has(href.replace(/\/$/,'')))throw Error(`Duplicate website: ${site.name}.`);siteIds.add(site.id);urls.add(href.replace(/\/$/,''));}
  for(const shortcut of data.shortcuts){text(shortcut.name,'Shortcut name',120);const href=url(shortcut.url);if(shortcuts.has(href))throw Error('Duplicate shortcut URL.');shortcuts.add(href);}
  if(!data.updatedAt||Number.isNaN(Date.parse(data.updatedAt)))throw Error('Invalid catalog update date.');
  return data;
 }
 function suggestion(value){return {name:text(value.name,'Website name',120),url:url(value.url),category:text(value.category,'Category',70),description:text(value.description,'Description',650)};}
 function parseSuggestion(body){const match=String(body||'').match(/```json\s*([\s\S]*?)```/);if(!match)throw Error('No structured website suggestion found in this issue.');return suggestion(JSON.parse(match[1]));}
 return {icons,text,url,idFor,clone,validate,suggestion,parseSuggestion};
});
