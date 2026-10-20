// Donation panel interactions.
(()=>{
 document.querySelectorAll('[data-copy-bkash]').forEach(button=>button.addEventListener('click',async()=>{const status=button.parentElement.querySelector('.copy-status');try{await navigator.clipboard.writeText('+8801925070109');status.textContent='Number copied.';}catch{status.textContent='Please select and copy the number above.';}}));
 const dialog=document.querySelector('#donate-dialog');
 document.querySelectorAll('[data-footer-year]').forEach(el=>el.textContent=new Date().getFullYear());
 document.querySelectorAll('[data-donate]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
 dialog.querySelector('.donate-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
})();
