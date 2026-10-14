const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
 const requests=[];page.on('request',r=>{if(r.url().includes('/exec'))requests.push(r.url());});
 await page.goto('http://127.0.0.1:4173/catalogo/?v=20261014b');
 await page.waitForFunction(()=>document.querySelectorAll('.product').length>0,{},{timeout:90000});
 const results=[];
 for(const code of ['TK200A','TK011','MCVT','SERV01']){
  await page.locator('#search').fill(code);await page.waitForTimeout(400);
  const card=page.locator('.product').filter({has:page.locator('.code',{hasText:new RegExp('^'+code+'$')})});
  await card.scrollIntoViewIfNeeded();
  await page.waitForFunction(code=>[...document.querySelectorAll('.product')].find(c=>c.dataset.code===code)?.querySelector('img')?.complete,code,{timeout:30000});
  const cardImages=await card.locator('.product-photos img').evaluateAll(imgs=>imgs.map(i=>({url:i.src,loaded:i.naturalWidth>0&&!i.src.includes('placeholder'),width:i.naturalWidth})));
  await card.locator('.detail-link').click();
  await page.waitForFunction(()=>document.querySelector('.detail-main')?.complete,{},{timeout:30000});
  const detail=await page.locator('.detail-main').evaluate(i=>({url:i.src,loaded:i.naturalWidth>0&&!i.src.includes('placeholder'),width:i.naturalWidth}));
  results.push({code,cardImages,detail,context:await page.locator('.detail-copy .eyebrow').textContent()});
  await page.screenshot({path:'catalogo/conferencia-'+code+'.png'});
  await page.locator('#close-detail').click();
 }
 await page.locator('#reload').click();await page.waitForFunction(()=>!document.querySelector('#reload').disabled,{},{timeout:90000});
 fs.writeFileSync('catalogo/conferencia-imagens-resultados.json',JSON.stringify({results,requests},null,2));
 console.log(JSON.stringify({results,apiRequests:requests.length,uniqueRequests:new Set(requests).size}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
