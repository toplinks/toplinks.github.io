(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./catalog-core.js'));else root.GitHubCatalog=factory(root.CatalogCore);})(typeof globalThis!=='undefined'?globalThis:this,Core=>{
 'use strict';
 const encode=value=>{const bytes=new TextEncoder().encode(value);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);};
 const decode=value=>new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0)));
 return class GitHubCatalog{
  #token='';#sha='';#fetch;#base;
  constructor(config,fetcher=(...args)=>globalThis.fetch(...args)){if(!/^[\w.-]+$/.test(config.owner)||!/^[\w.-]+$/.test(config.repo)||config.catalogPath!=='catalog.json')throw Error('Invalid repository configuration.');this.config=config;this.#base=`/repos/${config.owner}/${config.repo}`;this.#fetch=fetcher;this.branch='';}
  get connected(){return Boolean(this.#token&&this.#sha);}
  disconnect(){this.#token='';this.#sha='';this.branch='';}
  async #request(path,{method='GET',body,raw=false}={}){
   const headers={Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
   if(this.#token)headers.Authorization='Bearer '+this.#token;
   if(body)headers['Content-Type']='application/json';
   const response=await this.#fetch('https://api.github.com'+path,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store',redirect:'error'});
   if(!response.ok){if(response.status===409||response.status===422)throw Error('The repository changed or rejected this update. Your draft is safe. Reconnect to load the latest catalog before trying again.');if(response.status===401)throw Error('GitHub did not accept this token.');if(response.status===403)throw Error('GitHub denied access or its rate limit was reached. Check repository permissions and try again later.');if(response.status===404)throw Error('Repository or catalog.json not found. Upload this version to the configured repository first.');throw Error(`GitHub request failed (${response.status}).`);}
   return response.json();
  }
  async #read(){const path=`${this.#base}/contents/catalog.json?ref=${encodeURIComponent(this.branch)}`,file=await this.#request(path);if(!file.sha)throw Error('GitHub did not return a catalog revision.');const data=file.content?JSON.parse(decode(file.content)):await this.#request(path,{raw:true});return {data:Core.validate(data),sha:file.sha};}
  async connect(token){this.disconnect();if(!token||token.length<10)throw Error('Enter a GitHub token with Contents read/write access to this repository.');this.#token=token.trim();try{const repo=await this.#request(this.#base);if(!repo.permissions?.push)throw Error('This GitHub account does not have write access to the configured repository.');this.branch=repo.default_branch;const result=await this.#read();this.#sha=result.sha;return result.data;}catch(error){this.disconnect();throw error;}}
  async publish(data,message,issueIds=[]){
   if(!this.connected)throw Error('Connect to GitHub before committing.');Core.validate(data);
   const latest=await this.#read();if(latest.sha!==this.#sha)throw Error('Someone changed catalog.json after you connected. Download your draft, reconnect, and merge the latest changes first.');
   const closing=[...new Set(issueIds)].filter(id=>Number.isSafeInteger(id)&&id>0).map(id=>`Closes #${id}`).join('\n');
   const result=await this.#request(`${this.#base}/contents/catalog.json`,{method:'PUT',body:{message:Core.text(message,'Commit message',200)+(closing?'\n\n'+closing:''),content:encode(JSON.stringify(data,null,2)+'\n'),sha:this.#sha,branch:this.branch}});
   this.#sha=result.content.sha;return result;
  }
  async issues(page=1){if(!this.connected)throw Error('Connect to GitHub to review suggestions.');const items=await this.#request(`${this.#base}/issues?state=open&per_page=100&page=${Math.max(1,page)}`);return {hasMore:items.length===100,items:items.filter(issue=>!issue.pull_request&&issue.title.startsWith('[Website suggestion]')).map(issue=>({number:issue.number,title:issue.title,body:issue.body||'',url:issue.html_url}))};}
 };
});
