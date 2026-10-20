'use strict';
(async()=>{
 const $=selector=>document.querySelector(selector),Core=CatalogCore,repo=window.TOPLINKS_REPOSITORY,client=new GitHubCatalog(repo),storageKey='toplinks.design2.adminDraft.v1';
 const initial=(await window.toplinksCatalogReady).data;
 let data=Core.clone(initial),baseline=Core.clone(initial),tab='websites',page=1,issuePage=1,issues=[],issuesMore=false,dirty=false,busy=false,editing=null,reviewing=null,approved=new Map();
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const historyKey='toplinks.design2.adminHistory.v1';let history=[];
 try{const saved=JSON.parse(localStorage.getItem(historyKey)||'[]');if(Array.isArray(saved))history=saved.filter(item=>typeof item.message==='string'&&Number.isFinite(Date.parse(item.at))).slice(0,50);}catch{}
 function recordActivity(message){history.unshift({message,at:new Date().toISOString()});history=history.slice(0,50);try{localStorage.setItem(historyKey,JSON.stringify(history));}catch{}}
 function renderDashboard(){
  const metrics=[['Websites',data.websites.length],['Categories',data.categories.length],['Useful sites',data.shortcuts.length]];
  let pending=0;
  for(const key of ['websites','categories','shortcuts']){const identify=(item,index)=>key==='shortcuts'?index:item.id,old=new Map(baseline[key].map((item,index)=>[identify(item,index),JSON.stringify(item)])),next=new Map(data[key].map((item,index)=>[identify(item,index),JSON.stringify(item)]));for(const [id,value] of next)if(old.get(id)!==value)pending++;for(const id of old.keys())if(!next.has(id))pending++;}
  metrics.push(['Pending changes',pending]);
  const metricIcons=[['websites','<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/>'],['categories','<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'],['shortcuts','<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>'],['pending','<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h3"/><circle cx="18" cy="18" r="4"/><path d="M18 16v2l1 1"/>']];
  $('#dashboard-metrics').innerHTML=metrics.map(([label,count],index)=>`<div class="dashboard-metric"><span class="dashboard-card-icon menu-icon-${metricIcons[index][0]}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${metricIcons[index][1]}</svg></span><span class="dashboard-metric-label">${label}</span><strong>${count.toLocaleString()}</strong></div>`).join('');
  $('#dashboard-updated').textContent='Catalog updated '+new Date(data.updatedAt).toLocaleString();
  $('#recent-edits').innerHTML=history.slice(0,8).map(item=>`<li><span>${esc(item.message)}</span><time datetime="${esc(item.at)}">${esc(new Date(item.at).toLocaleString())}</time></li>`).join('')||'<li class="admin-help">Your edits will appear here as you manage the catalog.</li>';
 }
 const confirmation=document.createElement('dialog');confirmation.className='admin-dialog';confirmation.id='confirm-change';confirmation.setAttribute('aria-labelledby','confirm-change-title');confirmation.innerHTML='<form method="dialog"><h2 id="confirm-change-title">Confirm draft change</h2><p id="confirm-change-message"></p><div class="admin-actions"><button class="admin-button" value="cancel">Cancel</button><button class="admin-button primary" value="confirm">Continue</button></div></form>';document.body.appendChild(confirmation);
 function confirmChange(message){confirmation.querySelector('p').textContent=message;confirmation.returnValue='';confirmation.showModal();return new Promise(resolve=>{confirmation.onclose=()=>resolve(confirmation.returnValue==='confirm');});}
 function status(message,error=false){$('#admin-status').textContent=message;$('#admin-status').classList.toggle('error',error);}
 function updateButtons(){$("#studio-login").hidden=client.connected;$(".studio-layout").hidden=!client.connected;$(".studio-session").hidden=!client.connected;document.querySelectorAll('button').forEach(button=>{if(button.closest('.admin-page')||button.closest('.admin-dialog'))button.disabled=busy;});$('#publish').disabled=busy||!dirty||!client.connected;$('#disconnect').hidden=!client.connected;$('#disconnect').disabled=busy;$('#load-issues').disabled=busy||!client.connected;$('#connection-state').textContent=client.connected?`${repo.owner}/${repo.repo} · ${client.branch}`:'Not connected';$('#draft-state').textContent=dirty?'Uncommitted draft':'No pending edits';}
 function persist(message){Core.validate(data);data.updatedAt=new Date().toISOString();dirty=true;recordActivity(message);try{localStorage.setItem(storageKey,JSON.stringify({data,approved:[...approved]}));status(message+' Saved as a local draft.');}catch{status(message+' Draft is in this tab only; download it before closing.');}render();}
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){data=Core.validate(saved.data);approved=new Map(Array.isArray(saved.approved)?saved.approved:[]);dirty=true;status('Restored your uncommitted local draft.');}}catch{status('A previous draft could not be read. The published catalog is loaded.',true);}
 function formOptions(){const html=[...data.categories].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');$('#entry-category').innerHTML=html;$('#category-icon').innerHTML=Core.icons.map(icon=>`<option>${icon}</option>`).join('');}
 function render(){
  renderDashboard();
  formOptions();$('#admin-counts').textContent=`${data.websites.length} websites · ${data.categories.length} categories · ${data.shortcuts.length} shortcuts`;
  document.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tab===tab)));
  const query=$('#admin-search').value.trim().toLowerCase();let rows=tab==='websites'?data.websites:tab==='categories'?data.categories:tab==='shortcuts'?data.shortcuts:issues;
  rows=rows.map((entry,index)=>({...entry,_index:index})).filter(entry=>`${entry.name||entry.title} ${entry.url||''} ${entry.category||''}`.toLowerCase().includes(query));
  if(tab==='categories')rows.sort((a,b)=>a.name.localeCompare(b.name));
  const pages=Math.max(1,Math.ceil(rows.length/25));page=Math.max(1,Math.min(page,pages));const visible=rows.slice((page-1)*25,page*25);
  $('#new-entry').hidden=tab==='submissions';$('#new-entry').textContent=tab==='categories'?'Add category':tab==='shortcuts'?'Add shortcut':'Add website';$('#issue-tools').hidden=tab!=='submissions';
  $('#admin-list').innerHTML=visible.map(entry=>{
   if(tab==='submissions')return `<article class="admin-row"><div class="admin-row-content"><h3>${esc(entry.title)}</h3><p>Issue #${entry.number}</p></div><div class="admin-row-actions"><button class="admin-button" data-review="${entry.number}">Review</button><a class="admin-button" href="https://github.com/${repo.owner}/${repo.repo}/issues/${entry.number}" target="_blank" rel="noopener noreferrer">Open issue ↗</a></div></article>`;
   const id=tab==='shortcuts'?entry._index:entry.id;
   const detail=tab==='categories'?`${data.websites.filter(site=>site.category===entry.name).length} websites · ${entry.icon}`:tab==='shortcuts'?`${entry._index+1}. ${entry.url}`:`${entry.category} · ${entry.url}`;
   return `<article class="admin-row"><div class="admin-row-content"><h3>${esc(entry.name)}</h3><p>${esc(detail)}</p></div><div class="admin-row-actions">${tab==='shortcuts'?`<button class="admin-button" data-move="${entry._index}" data-direction="-1" aria-label="Move ${esc(entry.name)} up">↑</button><button class="admin-button" data-move="${entry._index}" data-direction="1" aria-label="Move ${esc(entry.name)} down">↓</button>`:''}<button class="admin-button" data-edit="${esc(id)}">Edit</button></div></article>`;
  }).join('')||'<p class="admin-help">'+(tab==='submissions'?'Connect to GitHub and load suggestions, or view the repository’s Issues tab.':'No matching entries.')+'</p>';
  $('#admin-page-count').textContent=`Page ${page} of ${pages} · ${rows.length} entries`;$('#admin-prev').disabled=page===1;$('#admin-next').disabled=page===pages;updateButtons();$('#admin-prev').disabled=busy||page===1;$('#admin-next').disabled=busy||page===pages;
 }
 function openEditor(key=null,suggestion=null,issue=null){
  editing=key;reviewing=issue;$('#editor-form').reset();$('#editor-error').textContent='';
  const category=tab==='categories',shortcut=tab==='shortcuts';$('#editor-title').textContent=(key===null?'Add ':'Edit ')+(category?'category':shortcut?'shortcut':'website');
  $('#website-fields').hidden=category;$('#category-fields').hidden=!category;$('#entry-category-wrap').hidden=shortcut;$('#entry-description-wrap').hidden=shortcut;$('#delete-entry').hidden=key===null;$('#approval-wrap').hidden=!issue;$('#approve-issue').checked=Boolean(issue);
  $('#entry-url').required=!category;$('#entry-name').required=!category;$('#entry-category').required=!category&&!shortcut;$('#entry-description').required=!category&&!shortcut;$('#category-name').required=category;
  if(category){const entry=data.categories.find(c=>c.id===key);$('#category-name').value=entry?.name||'';$('#category-icon').value=entry?.icon||'globe';const count=entry?data.websites.filter(site=>site.category===entry.name).length:0;$('#category-reassign-wrap').hidden=!count;$('#category-usage').textContent=`${count} websites use this category. Choose a replacement before deleting it.`;$('#category-reassign').innerHTML='<option value="">Choose replacement…</option>'+data.categories.filter(c=>c.id!==key).map(c=>`<option>${esc(c.name)}</option>`).join('');}
  else{const entry=suggestion||(key===null?null:shortcut?data.shortcuts[Number(key)]:data.websites.find(site=>site.id===key));$('#entry-name').value=entry?.name||'';$('#entry-url').value=entry?.url||'';$('#entry-description').value=entry?.description||'';if(entry?.category)$('#entry-category').value=entry.category;}
  $('#editor-dialog').showModal();
 }
 $('#editor-form').addEventListener('submit',event=>{event.preventDefault();try{
  const next=Core.clone(data);
  if(tab==='categories'){
   const name=Core.text($('#category-name').value,'Category name',70),icon=$('#category-icon').value,entry=next.categories.find(c=>c.id===editing);
   if(entry){const old=entry.name;entry.name=name;entry.icon=icon;next.websites.forEach(site=>{if(site.category===old)site.category=name;});}
   else next.categories.push({id:name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name,icon});
  }else if(tab==='shortcuts'){
   const item={name:Core.text($('#entry-name').value,'Shortcut name',120),url:Core.url($('#entry-url').value)};if(editing===null)next.shortcuts.push(item);else next.shortcuts[Number(editing)]=item;
  }else{
   const item=Core.suggestion({name:$('#entry-name').value,url:$('#entry-url').value,category:$('#entry-category').value,description:$('#entry-description').value});
   if(editing===null)next.websites.push({id:Core.idFor(item.url),...item});else Object.assign(next.websites.find(site=>site.id===editing),item);
   Core.validate(next);if(reviewing&&$('#approve-issue').checked)approved.set(editing||Core.idFor(item.url),reviewing);
  }
  Core.validate(next);data=next;$('#editor-dialog').close();persist(`${editing===null?'Added':'Updated'} ${tab==='categories'?'category':tab==='shortcuts'?'shortcut':'website'}: ${tab==='categories'?$('#category-name').value:$('#entry-name').value}.`);
 }catch(error){$('#editor-error').textContent=error.message;}});
 $('#delete-entry').addEventListener('click',async()=>{try{const next=Core.clone(data);let name;
  if(tab==='categories'){const entry=next.categories.find(c=>c.id===editing);name=entry.name;const used=next.websites.some(site=>site.category===name),replacement=$('#category-reassign').value;if(used&&!replacement)throw Error('Choose a replacement category before deleting this category.');next.websites.forEach(site=>{if(site.category===name)site.category=replacement;});next.categories=next.categories.filter(c=>c.id!==editing);}
  else if(tab==='shortcuts'){name=next.shortcuts[Number(editing)].name;next.shortcuts.splice(Number(editing),1);}
  else{name=next.websites.find(site=>site.id===editing).name;next.websites=next.websites.filter(site=>site.id!==editing);}
  if(!await confirmChange(`Remove “${name}” from your draft? Nothing changes on GitHub until you commit.`))return;Core.validate(next);data=next;if(tab==='websites')approved.delete(editing);$('#editor-dialog').close();persist(`Removed ${tab==='categories'?'category':tab==='shortcuts'?'shortcut':'website'}: ${name}.`);
 }catch(error){$('#editor-error').textContent=error.message;}});
 document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
 document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{tab=button.dataset.tab;page=1;$('#admin-search').value='';render();}));
 $('#admin-search').addEventListener('input',()=>{page=1;render();});$('#new-entry').addEventListener('click',()=>openEditor());
 $('#admin-prev').addEventListener('click',()=>{page--;render();});$('#admin-next').addEventListener('click',()=>{page++;render();});
 $('#admin-list').addEventListener('click',event=>{const edit=event.target.closest('[data-edit]'),move=event.target.closest('[data-move]'),review=event.target.closest('[data-review]');
  if(edit)openEditor(edit.dataset.edit);
  if(move){const from=Number(move.dataset.move),to=from+Number(move.dataset.direction);if(to<0||to>=data.shortcuts.length)return;[data.shortcuts[from],data.shortcuts[to]]=[data.shortcuts[to],data.shortcuts[from]];persist('Shortcut order updated.');}
  if(review){try{const issue=issues.find(item=>item.number===Number(review.dataset.review)),suggestion=Core.parseSuggestion(issue.body);if(!data.categories.some(c=>c.name===suggestion.category))throw Error('This suggestion uses an unknown category. Add that category first, then review it again.');const existing=data.websites.find(site=>site.id===Core.idFor(suggestion.url));tab='websites';render();openEditor(existing?.id||null,suggestion,issue.number);}catch(error){status(error.message,true);}}
 });
 function download(){const blob=new Blob([JSON.stringify(Core.validate(data),null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='catalog.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 $('#download-catalog').addEventListener('click',download);
 $('#import-catalog').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>12_000_000)throw Error('This file is too large.');const imported=Core.validate(JSON.parse(await file.text()));if(dirty&&!await confirmChange('Replace the current draft with this imported catalog?'))return;data=Core.clone(imported);approved.clear();persist('Catalog imported.');}catch(error){status(error.message,true);}event.target.value='';});
 $('#discard-draft').addEventListener('click',async()=>{if(!await confirmChange('Discard your uncommitted changes and restore the last loaded catalog?'))return;data=Core.clone(baseline);dirty=false;approved.clear();localStorage.removeItem(storageKey);recordActivity('Discarded local draft; restored loaded catalog.');status('Draft discarded.');render();});
 $('#connect-form').addEventListener('submit',async event=>{event.preventDefault();if(dirty&&!await confirmChange('Connecting loads the repository catalog and replaces this local draft. Download your draft first if you need to keep it. Continue?'))return;const token=$('#github-token').value;$('#github-token').value='';busy=true;updateButtons();status('Checking repository access and loading catalog.json…');try{const remote=await client.connect(token);data=Core.clone(remote);baseline=Core.clone(remote);dirty=false;approved.clear();localStorage.removeItem(storageKey);status('Connected. Edits remain drafts until you commit them.');}catch(error){status(error.message,true);}finally{busy=false;render();}});
 $('#disconnect').addEventListener('click',()=>{client.disconnect();status('Disconnected. Your draft remains local; the token was cleared from memory.');render();});
 const diff=(oldRows,newRows,key)=>{const old=new Map(oldRows.map((v,i)=>[key?v[key]:i,JSON.stringify(v)])),next=new Map(newRows.map((v,i)=>[key?v[key]:i,JSON.stringify(v)]));return {added:[...next.keys()].filter(k=>!old.has(k)).length,removed:[...old.keys()].filter(k=>!next.has(k)).length,changed:[...next.keys()].filter(k=>old.has(k)&&old.get(k)!==next.get(k)).length};};
 $('#publish').addEventListener('click',()=>{try{Core.validate(data);$('#publish-summary').textContent=['websites','categories','shortcuts'].map(key=>{const changes=diff(baseline[key],data[key],key==='shortcuts'?null:'id');return `${key}: ${changes.added} added, ${changes.changed} changed, ${changes.removed} removed`;}).join('\n');$('#commit-target').textContent=`${repo.owner}/${repo.repo} · ${client.branch} · catalog.json`;$('#publish-error').textContent='';$('#commit-message').value='Update Top Links catalog';$('#publish-dialog').showModal();}catch(error){status(error.message,true);}});
 $('#publish-form').addEventListener('submit',async event=>{event.preventDefault();busy=true;updateButtons();try{const next=Core.clone(data);next.updatedAt=new Date().toISOString();const closing=[...approved].filter(([id])=>next.websites.some(site=>site.id===id)).map(([,issue])=>issue);const result=await client.publish(next,$('#commit-message').value,closing);data=next;baseline=Core.clone(next);dirty=false;approved.clear();localStorage.removeItem(storageKey);$('#publish-dialog').close();recordActivity('Committed catalog to GitHub.');status('Committed to GitHub. The live site updates after the Pages deployment finishes.');$('#commit-link').href=`https://github.com/${repo.owner}/${repo.repo}/commit/${result.commit.sha}`;$('#commit-link').hidden=false;}catch(error){$('#publish-error').textContent=error.message;}finally{busy=false;render();}});
 async function loadIssues(){busy=true;updateButtons();try{const result=await client.issues(issuePage);issues=result.items;issuesMore=result.hasMore;page=1;status(`Loaded suggestion issues from GitHub (batch ${issuePage}).`);}catch(error){status(error.message,true);}finally{busy=false;render();$('#issues-next').disabled=!issuesMore;$('#issues-prev').disabled=issuePage===1;}}
 $('#load-issues').addEventListener('click',()=>{issuePage=1;loadIssues();});$('#issues-next').addEventListener('click',()=>{issuePage++;loadIssues();});$('#issues-prev').addEventListener('click',()=>{issuePage=Math.max(1,issuePage-1);loadIssues();});
 if($('#admin-status').textContent==='Loading the catalog…')status('Sign in with a GitHub token to open Studio.');
 window.addEventListener('beforeunload',()=>client.disconnect());render();
})();
