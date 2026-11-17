/* Execute: node catalogo/atualizar-valores.cjs
 * Consulta somente os links já conferidos por SKU em assets/js/loja.js.
 * Não altera a API, o Apps Script, imagens ou o site da loja.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context={window:{},URL};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'assets/js/loja.js'),'utf8'),context);
const store=context.window.CF_STORE;
function extractPrice(html,code){
  const sku=html.match(/<span\b[^>]*itemprop=["']sku["'][^>]*>([^<]+)<\/span>/i)?.[1]?.trim().toUpperCase();
  if(sku!==code.toUpperCase())throw new Error('Código da página não corresponde ao item');
  // Isola a área de compra do SKU principal. Nunca captura preços dos relacionados
  // nem o meta price (que nesta loja contém o valor com desconto no Pix).
  const areas=[...html.matchAll(/<div\b[^>]*class=["']([^"']*\bacoes-produto\b[^"']*)["'][^>]*>/gi)];
  const index=areas.findIndex(m=>m[1].split(/\s+/).some(c=>c.toUpperCase()==='SKU-'+code.toUpperCase()));
  if(index<0)throw new Error('Área de compra do item não encontrada');
  const start=areas[index],end=areas[index+1]?.index??html.length;
  const area=html.slice(start.index+start[0].length,end);
  if(!start[1].split(/\s+/).includes('disponivel'))return null;
  const value=area.match(/<strong\b[^>]*data-sell-price=["']([0-9]+(?:\.[0-9]{1,2})?)["'][^>]*>/i)?.[1];
  if(!value)return null;
  const amount=Number(value);return Number.isFinite(amount)&&amount>0?amount:null;
}
async function update(){
  const entries=Object.entries(store.links),products={},failures=[];
  let cursor=0;
  async function worker(){while(cursor<entries.length){
    const [code]=entries[cursor++],url=store.urlFor(code);
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'CF-Industrial-Price-Check/1.0'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const amount=extractPrice(await response.text(),code);
      products[code]={amount,currency:'BRL',checkedAt:new Date().toISOString()};
      console.log(code+': '+(amount===null?'sob consulta':amount.toFixed(2)));
    }catch(e){failures.push({code,error:e.message});console.error(code+': '+e.message);}
  }}
  await Promise.all([worker(),worker(),worker()]);
  // Uma falha geral nunca substitui um arquivo válido por um arquivo vazio.
  if(!Object.values(products).some(p=>p.amount>0))throw new Error('Nenhum preço confirmado; arquivo anterior preservado');
  const result={updatedAt:new Date().toISOString(),source:'Brazilian Imports',basis:'Preço principal anunciado, sem desconto específico por meio de pagamento',products:Object.fromEntries(Object.entries(products).sort()),failures};
  const file=path.join(__dirname,'data/precos-loja.json'),temp=file+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n');fs.renameSync(temp,file);
  console.log('Arquivo atualizado: '+file+'. Publique também este arquivo para atualizar o catálogo online.');
  if(failures.length)console.log(failures.length+' itens não confirmados: ficarão sob consulta.');
}
if(require.main===module)update().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={extractPrice};
