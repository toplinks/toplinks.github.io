const fs=require('fs'),path=require('path'),Core=require('../catalog-core.js');
const root=path.resolve(__dirname,'..'),output=path.resolve(root,'dist');
const data=Core.validate(JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8')));
if(output!==path.join(root,'dist')||path.dirname(output)!==root)throw Error('Unsafe build output path.');
if(fs.existsSync(output))fs.rmSync(output,{recursive:true});fs.mkdirSync(output);
const copy=(source,target)=>{const stat=fs.lstatSync(source);if(stat.isSymbolicLink())throw Error('Symbolic links are not allowed in site assets.');if(stat.isDirectory()){fs.mkdirSync(target,{recursive:true});for(const name of fs.readdirSync(source))copy(path.join(source,name),path.join(target,name));}else fs.copyFileSync(source,target);};
for(const name of fs.readdirSync(root)){const source=path.join(root,name);if(['icons','fonts','old'].includes(name))copy(source,path.join(output,name));else if(name==='.nojekyll'||(/\.(html|css|js|json|svg|txt|xml|md)$/.test(name)&&!['package.json','package-lock.json'].includes(name)))copy(source,path.join(output,name));}
fs.writeFileSync(path.join(output,'catalog-snapshot.js'),'// Generated from catalog.json. Do not edit directly.\nwindow.TOPLINKS_CATALOG_SNAPSHOT='+JSON.stringify(data)+';\n');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories=[...data.categories].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<li><a href="index.html?category=${encodeURIComponent(c.name)}#directory"><span>${escape(c.name)}</span><span class="page-count">${data.websites.filter(site=>site.category===c.name).length}</span></a></li>`).join('');
let sitemap=fs.readFileSync(path.join(output,'sitemap.html'),'utf8').replace(/<ul class="sitemap-categories">[\s\S]*?<\/ul>/,'<ul class="sitemap-categories">'+categories+'</ul>').replace(/Directory categories <span class="page-count">\d+<\/span>/,'Directory categories <span class="page-count">'+data.categories.length+'</span>');
if(!sitemap.includes('<li><a href="submit.html">'))sitemap=sitemap.replace('<ul class="sitemap-pages">','<ul class="sitemap-pages"><li><a href="submit.html">Suggest a website</a></li>');
fs.writeFileSync(path.join(output,'sitemap.html'),sitemap);
let about=fs.readFileSync(path.join(output,'about.html'),'utf8').replace(/Explore [\d,]+ websites across \d+ categories/,'Explore '+data.websites.length.toLocaleString('en-US')+' websites across '+data.categories.length+' categories');fs.writeFileSync(path.join(output,'about.html'),about);
const pages=['index','about','contact','terms','privacy','sitemap','submit'];fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(name=>`<url><loc>https://toplinks.github.io/${name==='index'?'':name+'.html'}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Built ${data.websites.length} websites, ${data.categories.length} categories, and ${data.shortcuts.length} useful sites into dist/.`);
