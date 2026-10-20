window.toplinksCatalogReady=(async()=>{
 let data;
 if(location.protocol!=='file:'){
  try{const response=await fetch('catalog.json',{cache:'no-cache'});if(!response.ok)throw Error('Catalog unavailable');data=CatalogCore.validate(await response.json());}catch{data=null;}
 }
 if(!data)data=CatalogCore.validate(window.TOPLINKS_CATALOG_SNAPSHOT);
 return {data,CATEGORIES:data.categories.map(c=>[c.name,c.icon]),LINKS:data.websites.map(({id,name,url,category,description},index)=>({id,name,url:CatalogCore.url(url),category,description,index})),USEFUL_LINKS:data.shortcuts.map(({name,url})=>({name,url:CatalogCore.url(url)}))};
})();
