const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({acceptDownloads:true});
 const results=[];
 for(const code of ['TK1717','TK200A','TK011']){
  await page.goto('http://127.0.0.1:4173/catalogo/panfleto.html?produto='+code+'&v=20261014c');
  await page.waitForFunction(()=>window.CF_FLYER,{},{timeout:90000});
  const result=await page.evaluate(()=>CF_FLYER);
  if(!result.ready||!result.photoLoaded)throw new Error(code+': '+JSON.stringify(result));
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);
  const path='catalogo/panfleto-exportado-'+code+'.png';await download.saveAs(path);
  const bytes=fs.readFileSync(path);if(bytes.readUInt32BE(16)!==1748||bytes.readUInt32BE(20)!==2480)throw new Error('Proporção incorreta');
  results.push({code,photoLoaded:result.photoLoaded,source:result.photoSource,width:result.width,height:result.height,downloadBytes:bytes.length});
 }
 fs.writeFileSync('catalogo/conferencia-exportacao-panfleto.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
