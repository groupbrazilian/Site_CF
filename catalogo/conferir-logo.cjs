const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage();
 await page.addInitScript(()=>localStorage.setItem('cf-panfleto:CONFERENCIA',JSON.stringify({token:'logo',createdAt:Date.now(),item:{codigo:'CONFERENCIA',nome:'Conferência da logo',familia:'Ferramentas',aplicacao:'Conferência visual',descricao:'Logo completa com proporção preservada.'}})));
 await page.goto('file:///C:/Users/admin/Documents/Site%20CF/catalogo/panfleto.html?produto=CONFERENCIA&ref=logo');
 await page.waitForFunction(()=>window.CF_FLYER,{},{timeout:30000});
 const result=await page.evaluate(async()=>{
  if(!CF_FLYER.ready)throw new Error(CF_FLYER.error);
  const logo=new Image();logo.src=CF_FLYER_ASSETS.brazilian;await logo.decode();
  const canvas=document.getElementById('renderer'),ctx=canvas.getContext('2d'),s=1748/1080,footer=2480/s-350;
  const crop=document.createElement('canvas');crop.width=800;crop.height=220;
  crop.getContext('2d').drawImage(canvas,300*s,(footer+232)*s,460*s,100*s,0,0,800,220);
  return {ready:true,width:canvas.width,height:canvas.height,logoWidth:logo.naturalWidth,logoHeight:logo.naturalHeight,crop:crop.toDataURL('image/png')};
 });
 fs.writeFileSync('catalogo/logo-conferida.png',Buffer.from(result.crop.split(',')[1],'base64'));
 delete result.crop;console.log(JSON.stringify(result));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
