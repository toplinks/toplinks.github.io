'use strict';
(async()=>{
const {LINKS,CATEGORIES,USEFUL_LINKS}=await window.toplinksCatalogReady;
const $ = selector => document.querySelector(selector);
let favorites = new Set();
try { const saved=JSON.parse(localStorage.getItem('toplinks.design2.favorites.v1') || '[]'); if(Array.isArray(saved)) favorites=new Set(saved.filter(id=>typeof id==='string')); } catch { /* Storage may be unavailable; favorites still work for this visit. */ }
let selected='All websites';
const requestedCategory=new URLSearchParams(location.search).get('category');
if(CATEGORIES.some(([name])=>name===requestedCategory))selected=requestedCategory;
const mobileGrid=window.matchMedia('(max-width:700px)');
let desktopColumns='3',mobileColumns='2',pageRows='7';
try{const desktop=localStorage.getItem('toplinks.design2.columns.v1'),mobile=localStorage.getItem('toplinks.design2.mobileColumns.v1'),rows=localStorage.getItem('toplinks.design2.pageRows.v1');if(['3','4','5'].includes(desktop))desktopColumns=desktop;if(['1','2'].includes(mobile))mobileColumns=mobile;if(['4','7','10'].includes(rows))pageRows=rows;}catch{}
function configureGrid(){
 const choices=mobileGrid.matches?['1','2']:['3','4','5'];
 const columns=mobileGrid.matches?mobileColumns:desktopColumns;
 $('#columns').innerHTML=choices.map(value=>`<option value="${value}">${value}</option>`).join('');
 $('#columns').value=columns;
 $('#cards').style.setProperty('--directory-columns',columns);
 $('#page-size').innerHTML=['4','7','10'].map(rows=>`<option value="${rows}">${Number(rows)*Number(columns)}</option>`).join('');
 $('#page-size').value=pageRows;
}
configureGrid();
const directoryPageSize=()=>Number($('#columns').value)*Number(pageRows);
let visibleLimit=directoryPageSize();
const symbols=Object.fromEntries(CATEGORIES);
const categoryColors=['#477ed0','#af65bd','#438c79','#d1843d','#bc617b','#708a42','#5e82b0','#b47a42','#7d71bf','#479697'];
// Editorial ordering of widely used resources, not live traffic measurements.
const popularPicks=['youtube.com','wikipedia.org','github.com','mail.google.com','chatgpt.com','maps.google.com','drive.google.com','canva.com','open.spotify.com','reddit.com','linkedin.com','netflix.com','amazon.com','stackoverflow.com','figma.com','notion.so','translate.google.com','bbc.com','reuters.com','coursera.org','khanacademy.org','freecodecamp.org','developer.mozilla.org','unsplash.com','pexels.com','trello.com','dropbox.com','zoom.us','slack.com','grammarly.com','claude.ai','gemini.google.com','perplexity.ai','huggingface.co','ubuntu.com','linuxmint.com','debian.org','fedoraproject.org','archlinux.org','opensuse.org','kali.org','manjaro.org','zorin.com','system76.com','1337x.to','thepiratebay.org','nyaa.si','limetorrents.com','torrentdownloads.me','ext.to','eztvx.to','academictorrents.com','qbittorrent.org','transmissionbt.com','prothomalo.com','thedailystar.net','bdnews24.com','bdjobs.com','daraz.com.bd','rokomari.com','bkash.com','bikroy.com','booking.com','airbnb.com','tripadvisor.com','skyscanner.net','steamcommunity.com','store.steampowered.com','itch.io','lichess.org','chess.com','cricbuzz.com','espncricinfo.com','espn.com','archive.org','gutenberg.org','openlibrary.org','goodreads.com','scholar.google.com','arxiv.org','pubmed.ncbi.nlm.nih.gov','who.int','nhs.uk','mayoclinic.org','allrecipes.com','bbcgoodfood.com','vercel.com','netlify.com','cloudflare.com','bitwarden.com','signal.org','proton.me'];
const popularRank=new Map(popularPicks.map((id,index)=>[id,index]));
const escapeHtml = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const host = link => new URL(link.url).hostname.replace(/^www\./,'');
const icon = (link, cls) => {const domain=host(link),available=SITE_ICONS.has(domain),extension=['drive.google.com','mail.google.com','keep.google.com'].includes(domain)?'svg':(SITE_ICON_FORMATS[domain]||'png');return `<span class="${cls} website-logo" style="--tint:${link.tint||'transparent'};--color:${link.color||'currentColor'}" aria-hidden="true">${available?`<img src="icons/sites/${domain}.${extension}" alt="" width="24" height="24" loading="lazy" decoding="async">`:''}<span class="logo-fallback generic-site-icon"></span></span>`;};
document.addEventListener('error',event=>{if(event.target.matches?.('.website-logo img'))event.target.hidden=true;},true);
function saveFavorites(){try{localStorage.setItem('toplinks.design2.favorites.v1',JSON.stringify([...favorites]));}catch{} }
function renderCategories(){
 const categories=[['All websites','layout-grid',LINKS.length],['My favorites','star',LINKS.filter(l=>favorites.has(l.id)).length],...[...CATEGORIES].sort((a,b)=>a[0].localeCompare(b[0])).map(([name,symbol])=>[name,symbol,LINKS.filter(l=>l.category===name).length])];
 $('#categories').innerHTML=categories.map(([name,symbol,count],index)=>`<button type="button" class="category${selected===name?' active':''}" data-category="${escapeHtml(name)}" aria-pressed="${selected===name}"><span class="cat-symbol" style="--category-color:${categoryColors[index%categoryColors.length]}" aria-hidden="true">${name==='Bangladesh'?'<img class="category-flag" src="icons/bangladesh.svg" width="18" height="11" alt="">':`<svg viewBox="0 0 24 24"><use href="#${symbol}"></use></svg>`}</span><span class="category-name">${escapeHtml(name)}</span><span class="count">${count}</span></button>`).join('');
 $('#favorite-count').textContent=LINKS.filter(l=>favorites.has(l.id)).length;
}
function render(loadMore=false){
 if(loadMore!==true)visibleLimit=directoryPageSize();
 const query=$('#search').value.trim().toLocaleLowerCase();
 const words=query.split(/\s+/).filter(Boolean);
 let filtered=LINKS.filter(l=>(selected==='All websites'||(selected==='My favorites'?favorites.has(l.id):l.category===selected))&&words.every(w=>`${l.name} ${l.description} ${l.category} ${host(l)}`.toLocaleLowerCase().includes(w)));
 if($('#sort').value==='az')filtered.sort((a,b)=>a.name.localeCompare(b.name));
 if($('#sort').value==='popular')filtered.sort((a,b)=>(popularRank.get(a.id)??Infinity)-(popularRank.get(b.id)??Infinity)||a.name.localeCompare(b.name));
 $('#popular-note').hidden=$('#sort').value!=='popular';
 $('#current-category').textContent=selected;
 $('#result-count').textContent=`${filtered.length} ${filtered.length===1?'website':'websites'}${query?' found':' to explore'} · Showing ${Math.min(visibleLimit,filtered.length)}`;
 $('#empty').hidden=filtered.length>0;
 $('#load-more').hidden=filtered.length<=visibleLimit;
 $('#load-more').textContent=`Show more websites (${Math.min(visibleLimit,filtered.length)} of ${filtered.length})`;
 $('#cards').innerHTML=filtered.slice(0,visibleLimit).map(l=>`<article class="card"><div class="card-top">${icon(l,'site-icon')}<button type="button" class="favorite" data-favorite="${escapeHtml(l.id)}" aria-label="${favorites.has(l.id)?'Remove':'Save'} ${escapeHtml(l.name)} ${favorites.has(l.id)?'from':'to'} favorites" aria-pressed="${favorites.has(l.id)}">${favorites.has(l.id)?'★':'☆'}</button></div><h4><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.name)}<span class="sr-only"> (opens in a new tab)</span></a></h4><p class="description">${escapeHtml(l.description)}</p><div class="card-bottom"><span class="tag">${escapeHtml(l.category)}</span><span>${escapeHtml(host(l))}</span></div></article>`).join('');
}
let shortcutVisits={};
try{const saved=JSON.parse(localStorage.getItem('toplinks.design2.shortcutVisits.v1')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const link of USEFUL_LINKS){const n=saved[link.url];if(Number.isSafeInteger(n)&&n>0)shortcutVisits[link.url]=n;}}catch{}
try{const saved=localStorage.getItem('toplinks.design2.shortcutSort.v1');if(['original','az','visited'].includes(saved))$('#useful-sort').value=saved;}catch{}
function renderUseful(){
 const sort=$('#useful-sort').value;
 const links=USEFUL_LINKS.map((link,index)=>({...link,index,visits:shortcutVisits[link.url]||0}));
 if(sort==='az')links.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
 if(sort==='visited')links.sort((a,b)=>b.visits-a.visits||a.index-b.index);
 $('#useful-visit-note').hidden=sort!=='visited';
 $('#quick-links').innerHTML=links.map(l=>`<a href="${escapeHtml(l.url)}" data-shortcut="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${icon(l,'shortcut-logo')}<span class="shortcut-name">${escapeHtml(l.name)}</span>${sort==='visited'?`<span class="visit-count" aria-label="${l.visits} visits">${l.visits}</span>`:''}<span class="sr-only"> (opens in a new tab)</span></a>`).join('');
}
$('#useful-sort').addEventListener('change',()=>{try{localStorage.setItem('toplinks.design2.shortcutSort.v1',$('#useful-sort').value);}catch{}renderUseful();});
function countShortcut(event){if(event.type==='auxclick'&&event.button!==1)return;const link=event.target.closest('[data-shortcut]');if(!link)return;const url=link.dataset.shortcut;shortcutVisits[url]=(shortcutVisits[url]||0)+1;try{localStorage.setItem('toplinks.design2.shortcutVisits.v1',JSON.stringify(shortcutVisits));}catch{}if($('#useful-sort').value==='visited')setTimeout(renderUseful,0);}
$('#quick-links').addEventListener('click',countShortcut);
$('#quick-links').addEventListener('auxclick',countShortcut);
renderUseful();
$('#categories').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;selected=button.dataset.category;renderCategories();render();});
$('#cards').addEventListener('click',event=>{const button=event.target.closest('[data-favorite]');if(!button)return;const id=button.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);saveFavorites();renderCategories();render();const replacement=[...document.querySelectorAll('[data-favorite]')].find(b=>b.dataset.favorite===id);if(replacement)replacement.focus();else $('#search').focus();});
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);
$('#columns').addEventListener('change',()=>{const value=$('#columns').value;if(mobileGrid.matches)mobileColumns=value;else desktopColumns=value;try{localStorage.setItem(mobileGrid.matches?'toplinks.design2.mobileColumns.v1':'toplinks.design2.columns.v1',value);}catch{}configureGrid();render();});
$('#page-size').addEventListener('change',()=>{pageRows=$('#page-size').value;try{localStorage.setItem('toplinks.design2.pageRows.v1',pageRows);}catch{}render();});
mobileGrid.addEventListener('change',()=>{configureGrid();render();});
$('#favorites-nav').addEventListener('click',()=>{selected='My favorites';$('#search').value='';renderCategories();render();});
$('#reset').addEventListener('click',()=>{selected='All websites';$('#search').value='';renderCategories();render();$('#search').focus();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('#privacy-dialog').open){event.preventDefault();$('#web-query').focus();}});
$('#web-search').addEventListener('submit',event=>{const input=$('#web-query');input.value=input.value.trim();if(!input.value){event.preventDefault();input.focus();}});
$('#privacy').addEventListener('click',()=>$('#privacy-dialog').showModal());$('#close-privacy').addEventListener('click',()=>$('#privacy-dialog').close());
$('#load-more').addEventListener('click',()=>{visibleLimit+=directoryPageSize();render(true);});
$('#year').textContent=new Date().getFullYear();renderCategories();render();
const directorySticky=document.querySelector('.directory-sticky');
if(directorySticky){
 const updateStickyHeight=()=>document.documentElement.style.setProperty('--directory-sticky-height',`${directorySticky.getBoundingClientRect().height}px`);
 new ResizeObserver(updateStickyHeight).observe(directorySticky);
 updateStickyHeight();
}



})();
