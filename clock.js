'use strict';
(()=>{
 const date=document.querySelector('#local-date'),time=document.querySelector('#local-time'),country=document.querySelector('#local-country');
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 const countries={Dhaka:'Bangladesh',Calcutta:'India',Kolkata:'India',Karachi:'Pakistan',Colombo:'Sri Lanka',Kathmandu:'Nepal',Katmandu:'Nepal',Dubai:'United Arab Emirates',Riyadh:'Saudi Arabia',Singapore:'Singapore',Kuala_Lumpur:'Malaysia',Bangkok:'Thailand',Jakarta:'Indonesia',Tokyo:'Japan',Seoul:'South Korea',Shanghai:'China',Hong_Kong:'Hong Kong',Taipei:'Taiwan',Manila:'Philippines',London:'United Kingdom',Paris:'France',Berlin:'Germany',Rome:'Italy',Madrid:'Spain',Amsterdam:'Netherlands',Lisbon:'Portugal',Istanbul:'Türkiye',Moscow:'Russia',Toronto:'Canada',Vancouver:'Canada',New_York:'United States',Chicago:'United States',Denver:'United States',Los_Angeles:'United States',Phoenix:'United States',Anchorage:'United States',Honolulu:'United States',Sydney:'Australia',Melbourne:'Australia',Perth:'Australia',Auckland:'New Zealand',Cairo:'Egypt',Johannesburg:'South Africa',Lagos:'Nigeria',Nairobi:'Kenya',Sao_Paulo:'Brazil',Mexico_City:'Mexico',Buenos_Aires:'Argentina'};
 const city=zone?.split('/').pop();
 country.textContent=countries[city]||'Country unavailable';
 country.title='Estimated from browser timezone: '+(zone||'unavailable')+'. This may differ from your physical location.';
 country.setAttribute('aria-label',country.textContent+' — estimated from browser timezone');
 function update(){const now=new Date();date.textContent=new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(now);date.dateTime=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');time.textContent=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(now);time.dateTime=now.toISOString();}
 update();setInterval(update,1000);
})();


