(() => {
  'use strict';
  // A única lista editável fica em CONTACTS, no config.js. IDs devem ser estáveis.
  const ids=new Set();
  const list=Object.freeze((CF_CONFIG.CONTACTS||[]).filter(c=>c&&c.active!==false).map(c=>({...c,id:String(c.id||'').trim(),name:String(c.name||'').trim(),region:String(c.region||'Atendimento').trim(),phone:String(c.phone||'').replace(/\D/g,'')})).filter(c=>{
    if(!/^[a-z0-9][a-z0-9_-]*$/.test(c.id)||!c.name||!/^55\d{10,11}$/.test(c.phone)||ids.has(c.id))return false;
    ids.add(c.id);return true;
  }).map(Object.freeze));
  const find=id=>list.find(c=>c.id===id);
  const primary=list.find(c=>c.primary===true)||list.find(c=>c.phone===CF_CONFIG.WHATSAPP)||list[0];
  function resolve(includeContact=false){const params=new URLSearchParams(location.search),requested=params.get('vendedor')||(includeContact?params.get('contato'):'');return {requested,selected:find(requested),invalid:Boolean(requested&&!find(requested)),personal:Boolean(params.get('vendedor')&&find(params.get('vendedor')))};}
  function catalogURL(contact,base=CF_CONFIG.DIGITAL_PRODUCT_URL){const url=new URL(base,location.href);url.searchParams.delete('contato');if(contact)url.searchParams.set('vendedor',contact.id);else url.searchParams.delete('vendedor');return url;}
  const format=contact=>contact.phone.replace(/^55/,'').replace(/^(\d{2})(\d{4,5})(\d{4})$/,'($1) $2-$3');
  const whatsapp=(contact,message='')=>'https://wa.me/'+contact.phone+(message?'?text='+encodeURIComponent(message):'');
  window.CF_CONTACTS=Object.freeze({list,find,primary,resolve,catalogURL,format,whatsapp});
})();
