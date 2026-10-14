const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
 await page.goto('http://127.0.0.1:4173/catalogo/');
 const result=await page.evaluate(async()=>{
  const {products}=await CF_API.getProducts(true);
  const rows=[];
  for(const code of ['TK1717','TK200A','TK011']){
   const p=products.find(p=>p.codigo===code),url=p.imagem_grande;
   const id=new URL(url).searchParams.get('id');
   for(const [mode,address,cors] of [['api-display',url,false],['api-export',url,true],['same-file-export','https://lh3.googleusercontent.com/d/'+id+'=w1600',true]]){
    rows.push(await new Promise(resolve=>{const i=new Image();if(cors)i.crossOrigin='anonymous';const timer=setTimeout(()=>resolve({code,mode,loaded:false,timeout:true}),15000);i.onerror=()=>{clearTimeout(timer);resolve({code,mode,loaded:false});};i.onload=()=>{clearTimeout(timer);let exported=false;try{const c=document.createElement('canvas');c.width=20;c.height=20;c.getContext('2d').drawImage(i,0,0,20,20);exported=c.toDataURL().startsWith('data:image/png');}catch{}resolve({code,mode,loaded:true,exported});};i.src=address;}));
   }
  }return rows;
 });
 fs.writeFileSync('catalogo/conferencia-cors-panfleto.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
