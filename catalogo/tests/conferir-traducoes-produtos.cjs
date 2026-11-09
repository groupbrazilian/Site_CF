const {chromium}=require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const snapshot=JSON.parse(fs.readFileSync('catalogo/tests/traducao-api.json','utf8'));
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('catalogo/assets/js/traducoes-produtos.js','utf8'),sandbox);
const dictionary=sandbox.window.CF_PRODUCT_TRANSLATIONS;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
 let calls=0;
 await context.route('https://script.google.com/**',r=>{calls++;return r.fulfill({contentType:'application/json',body:JSON.stringify(snapshot)});});
 await context.route(/https:\/\/(drive\.google\.com|lh3\.googleusercontent\.com)\//,r=>r.fulfill({contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:fs.readFileSync('catalogo/assets/img/panfleto/cf-logo.png')}));
 await context.addInitScript(()=>{window.canvasLabels=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(...args){window.canvasLabels.push(args[0]);return original.apply(this,args);};});
 await page.goto('http://127.0.0.1:4173/catalogo/?lang=es&vendedor=thiago');await page.waitForFunction(()=>document.querySelectorAll('.product').length===71);
 for(const [lang,index] of [['es',1],['en',0],['pt-BR',-1]]){
  await page.evaluate(lang=>CF_I18N.setLanguage(lang),lang);
  for(const p of snapshot.produtos){const card=page.locator('.product[data-code="'+p.codigo+'"]');assert.equal(await card.locator('.product-name').textContent(),index<0?p.nome:dictionary[p.nome][index]);for(const [selector,field] of [['.technical:not(.description) p','aplicacao'],['.description p','descricao']]){if(p[field])assert.equal(await card.locator(selector).textContent(),index<0?p[field]:dictionary[p[field]][index],p.codigo+' '+lang+' '+field);}}
 }
 await page.evaluate(()=>CF_I18N.setLanguage('es'));await page.fill('#search','SERV01');await page.waitForFunction(()=>document.querySelectorAll('.product').length===1);const p=snapshot.produtos.find(p=>p.codigo==='SERV01');
 await page.locator('.detail-link').click();await page.waitForFunction(()=>document.querySelector('#detail-title').textContent.startsWith('Pruebas'));assert.equal(await page.locator('#detail-title').textContent(),dictionary[p.nome][1]);const details=await page.locator('.detail-copy').textContent();assert(details.includes(dictionary[p.descricao][1])&&details.includes(dictionary[p.aplicacao][1]));await page.locator('#close-detail').click();
 await page.locator('.product').scrollIntoViewIfNeeded();await page.screenshot({path:'catalogo/tests/traducao-servico-es.png'});await page.emulateMedia({media:'print'});assert.equal(await page.locator('.product-name').textContent(),dictionary[p.nome][1]);await page.emulateMedia({media:'screen'});
 for(const code of ['TK200A','TK1717','MCVT','SERV01']){
  const flyer=await context.newPage();await flyer.goto('http://127.0.0.1:4173/catalogo/panfleto.html?produto='+code+'&lang=en&contato=thiago');await flyer.waitForFunction(()=>window.CF_FLYER,{},{timeout:60000});assert(await flyer.evaluate(()=>CF_FLYER.ready),code+' flyer ready');const item=snapshot.produtos.find(p=>p.codigo===code);let text=await flyer.evaluate(()=>canvasLabels.join(' '));assert(text.includes(dictionary[item.aplicacao][0]),code+' application');assert(text.includes(dictionary[item.descricao][0]),code+' description');assert(text.includes(dictionary[item.nome][0].toUpperCase()),code+' title');
  await flyer.locator('[data-cf-language="es"]').click();await flyer.waitForFunction(()=>!document.querySelector('#download').disabled);text=await flyer.evaluate(()=>canvasLabels.join(' '));assert(text.includes(dictionary[item.aplicacao][1]),code+' ES application');assert(text.includes(dictionary[item.descricao][1]),code+' ES description');await flyer.close();
 }
 // Uma edição na origem nunca deve exibir a especificação antiga traduzida.
 p.descricao='Especificação nova ainda não traduzida.';await page.locator('#reload').click();await page.waitForFunction(()=>document.querySelector('.description p').textContent==='Especificação nova ainda não traduzida.');
 await page.fill('#search','');await page.selectOption('#type','Máquinas');await page.evaluate(()=>CF_I18N.setLanguage('en'));await page.fill('#search','Vacuum');await page.waitForFunction(()=>document.querySelectorAll('.product').length===1);assert.equal(await page.locator('.product .code').textContent(),'MCVT');
 assert.deepEqual(errors,[]);fs.writeFileSync('catalogo/tests/traducoes-produtos-resultados.json',JSON.stringify({products:71,languages:['pt-BR','en','es'],fields:['nome','descricao','aplicacao'],cards:true,details:true,flyers:['TK200A','TK1717','MCVT','SERV01'],print:true,translatedSearch:true,sourceChangePreserved:true,apiCalls:calls,errors},null,2));console.log('71 itens PT/EN/ES, detalhes, 4 panfletos, impressão, busca e edição na origem: OK');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

